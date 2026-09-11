import type { CanActivate } from '@nestjs/common';
import {
  type ExecutionContext,
  Inject,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import type { Actor, Permission, Scope } from '@churchos/auth';
import { and, eq } from 'drizzle-orm';
import {
  permissions,
  rolePermissions,
  userPermissionScopes,
  userPersonLinks,
  userRoles,
  users,
} from '@churchos/db';
import type { Database } from '@churchos/db';
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
  const scopes =
    typeof payload['scopes'] === 'object' && payload['scopes'] !== null
      ? (payload['scopes'] as Partial<Record<Permission, Scope[]>>)
      : undefined;
  return { id: sub, permissions, scopes, personId, email };
}

@Injectable()
export class OidcAuthGuard implements CanActivate {
  private readonly getKey?: JWTVerifyGetKey;
  private readonly testMode: boolean;
  private readonly issuer?: string;
  private readonly audience?: string;

  constructor(
    @Optional() @Inject('OIDC_TEST_KEY') testKey?: JWTVerifyGetKey,
    @Optional() @Inject('DATABASE') private readonly db: Database | null = null,
  ) {
    this.testMode = Boolean(testKey);
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
    if (!testKey && this.getKey && (!this.issuer || !this.audience)) {
      throw new Error('OIDC_ISSUER and OIDC_AUDIENCE are required when OIDC is configured');
    }
    if (!testKey && process.env.NODE_ENV === 'production' && !this.getKey) {
      throw new Error('OIDC configuration is required in production');
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
        return this.testMode ? actor : this.loadApplicationActor(actor);
      } catch (error) {
        if (error instanceof UnauthorizedException) throw error;
        throw new UnauthorizedException('Invalid or expired token');
      }
    }

    const allowUnsigned = process.env.NODE_ENV !== 'production';
    if (!allowUnsigned) throw new UnauthorizedException('OIDC authentication is not configured');
    try {
      const json = Buffer.from(token.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
        'utf8',
      );
      return claimsToActor(JSON.parse(json) as JWTPayload);
    } catch {
      return null;
    }
  }

  private async loadApplicationActor(claims: Actor): Promise<Actor> {
    if (!this.db) throw new UnauthorizedException('Application identity store is unavailable');
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.externalSubject, claims.id), eq(users.isActive, true)))
      .limit(1);
    if (!user) throw new UnauthorizedException('User is not provisioned or is inactive');

    const assigned = await this.db
      .select({ name: permissions.name })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(eq(userRoles.userId, user.id));
    const [link] = await this.db
      .select({ personId: userPersonLinks.personId })
      .from(userPersonLinks)
      .where(eq(userPersonLinks.userId, user.id))
      .limit(1);
    const scopeRows = await this.db
      .select({ permission: userPermissionScopes.permission, scope: userPermissionScopes.scope })
      .from(userPermissionScopes)
      .where(eq(userPermissionScopes.userId, user.id));
    const scopes: Partial<Record<Permission, Scope[]>> = {};
    for (const row of scopeRows) {
      const perm = row.permission as Permission;
      const scope = row.scope as Scope;
      if (!scopes[perm]) scopes[perm] = [];
      scopes[perm]!.push(scope);
    }
    return {
      id: user.id,
      permissions: assigned.map((item) => item.name as Permission),
      scopes: Object.keys(scopes).length ? scopes : undefined,
      personId: link?.personId,
      email: user.email ?? claims.email,
    };
  }
}
