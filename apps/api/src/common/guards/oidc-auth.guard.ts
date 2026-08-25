import type { CanActivate } from '@nestjs/common';
import { type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Actor, Permission } from '@churchos/auth';
import {
  createLocalJWKSet,
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';

/**
 * OIDC JWT verification guard (B-01, ADR 0003).
 *
 * Production: verifies RS256 ID/access tokens against the identity provider's
 * JWKS (`OIDC_JWKS_URI`), enforcing `OIDC_ISSUER` and `OIDC_AUDIENCE`.
 * Permissions are read from the `permissions` array claim (managed by the
 * identity provider / admin roles); `personId` claim is honored when present
 * (synced from user_person_links, B-02).
 *
 * Development fallback: when NO OIDC config is present, accepts unsigned
 * base64url JSON tokens (the old MockAuthGuard behavior) so local dev works
 * without an identity provider. This path is inert the moment OIDC_JWKS_URI
 * or OIDC_JWKS_JSON is configured.
 *
 * ChurchOS never sees passwords — the provider owns authentication.
 */

export function claimsToActor(payload: JWTPayload): Actor | null {
  const sub = payload.sub;
  if (!sub) return null;
  const permissions = Array.isArray(payload.permissions)
    ? (payload.permissions.filter((p): p is Permission => typeof p === 'string') as Permission[])
    : [];
  const personId =
    typeof payload['personId'] === 'string' ? (payload['personId'] as string) : undefined;
  const email = typeof payload['email'] === 'string' ? (payload['email'] as string) : undefined;
  return { id: sub, permissions, personId, email };
}

@Injectable()
export class OidcAuthGuard implements CanActivate {
  private readonly getKey?: JWTVerifyGetKey;
  private readonly issuer?: string;
  private readonly audience?: string;

  constructor(testKey?: JWTVerifyGetKey) {
    this.issuer = process.env.OIDC_ISSUER;
    this.audience = process.env.OIDC_AUDIENCE;
    if (testKey) {
      this.getKey = testKey;
    } else if (process.env.OIDC_JWKS_JSON) {
      this.getKey = createLocalJWKSet(
        JSON.parse(process.env.OIDC_JWKS_JSON) as Parameters<typeof createLocalJWKSet>[0],
      );
    } else if (process.env.OIDC_JWKS_URI) {
      this.getKey = createRemoteJWKSet(new URL(process.env.OIDC_JWKS_URI));
    }
  }

  get oidcConfigured(): boolean {
    return this.getKey !== undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      actor?: Actor | null;
      headers: Record<string, string | string[] | undefined>;
    }>();
    const auth = request.headers['authorization'];
    request.actor = await this.resolveActor(typeof auth === 'string' ? auth : undefined);
    return true;
  }

  async resolveActor(authorizationHeader?: string): Promise<Actor | null> {
    if (!authorizationHeader?.startsWith('Bearer ')) return null;
    const token = authorizationHeader.slice(7).trim();

    if (this.getKey) {
      try {
        const { payload } = await jwtVerify(token, this.getKey, {
          issuer: this.issuer,
          audience: this.audience,
        });
        const actor = claimsToActor(payload);
        if (!actor) throw new UnauthorizedException('Token missing sub claim');
        return actor;
      } catch (error) {
        if (error instanceof UnauthorizedException) throw error;
        throw new UnauthorizedException('Invalid or expired token');
      }
    }

    // Dev fallback — unsigned mock tokens. Never active when OIDC is configured.
    try {
      const json = Buffer.from(token.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
        'utf8',
      );
      return claimsToActor(JSON.parse(json) as JWTPayload);
    } catch {
      return null;
    }
  }
}
