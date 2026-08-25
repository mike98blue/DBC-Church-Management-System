import { describe, expect, it } from 'vitest';
import {
  generateKeyPair,
  exportJWK,
  importJWK,
  SignJWT,
  createLocalJWKSet,
  type JWTPayload,
} from 'jose';
import type { Actor } from '@churchos/auth';
import { OidcAuthGuard, claimsToActor } from './oidc-auth.guard';

function makeRequest(auth?: string): {
  actor?: Actor | null;
  headers: Record<string, string | string[] | undefined>;
} {
  return { headers: auth ? { authorization: auth } : {} };
}

function makeContext(req: ReturnType<typeof makeRequest>) {
  return { switchToHttp: () => ({ getRequest: () => req }) } as unknown as Parameters<
    OidcAuthGuard['canActivate']
  >[0];
}

async function makeTestSetup() {
  const { publicKey, privateKey } = await generateKeyPair('RS256', { extractable: true });
  const jwk = await exportJWK(publicKey);
  jwk.alg = 'RS256';
  jwk.use = 'sig';
  const kid = 'test-key-1';
  jwk.kid = kid;
  const getKey = createLocalJWKSet({ keys: [jwk as never] });

  async function sign(payload: JWTPayload): Promise<string> {
    const pk = await importJWK(await exportJWK(privateKey), 'RS256');
    return new SignJWT(payload).setProtectedHeader({ alg: 'RS256', kid }).sign(pk);
  }

  return { getKey, sign };
}

describe('OidcAuthGuard (B-01)', () => {
  it('verifies a valid RS256 token and maps claims to an actor', async () => {
    const { getKey, sign } = await makeTestSetup();
    const guard = new OidcAuthGuard(getKey);
    const token = await sign({
      sub: 'auth0|123',
      permissions: ['people.read', 'people.write'],
      personId: '00000000-0000-0000-0000-000000000001',
    });
    const req = makeRequest(`Bearer ${token}`);
    await guard.canActivate(makeContext(req));
    expect(req.actor).toEqual({
      id: 'auth0|123',
      permissions: ['people.read', 'people.write'],
      personId: '00000000-0000-0000-0000-000000000001',
      email: undefined,
    });
  });

  it('rejects a token signed with the wrong key', async () => {
    const { getKey, sign } = await makeTestSetup();
    const guard = new OidcAuthGuard(getKey);
    const other = await makeTestSetup();
    const token = await other.sign({ sub: 'attacker' });
    await expect(guard.resolveActor(`Bearer ${token}`)).rejects.toThrow();
    void sign;
  });

  it('rejects when sub is missing even with valid signature', async () => {
    const { getKey, sign } = await makeTestSetup();
    const guard = new OidcAuthGuard(getKey);
    const token = await sign({ permissions: ['people.read'] });
    await expect(guard.resolveActor(`Bearer ${token}`)).rejects.toThrow('Token missing sub claim');
  });

  it('returns null when no authorization header', async () => {
    const { getKey } = await makeTestSetup();
    const guard = new OidcAuthGuard(getKey);
    expect(await guard.resolveActor(undefined)).toBeNull();
  });

  it('dev fallback: parses unsigned mock tokens when OIDC is not configured', async () => {
    const guard = new OidcAuthGuard();
    expect(guard.oidcConfigured).toBe(false);
    const payload = Buffer.from(
      JSON.stringify({ sub: 'dev-user', permissions: ['people.read'] }),
    ).toString('base64url');
    const actor = await guard.resolveActor(`Bearer ${payload}`);
    expect(actor?.id).toBe('dev-user');
    expect(actor?.permissions).toEqual(['people.read']);
  });

  it('claimsToActor ignores non-string permission entries', () => {
    const actor = claimsToActor({ sub: 'x', permissions: ['people.read', 42, null] });
    expect(actor?.permissions).toEqual(['people.read']);
  });
});

describe('claimsToActor', () => {
  it('returns null without sub', () => {
    expect(claimsToActor({} as JWTPayload)).toBeNull();
  });
});
