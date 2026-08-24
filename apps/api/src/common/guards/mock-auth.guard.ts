import type { CanActivate} from '@nestjs/common';
import { type ExecutionContext, Injectable } from '@nestjs/common';
import type { Actor } from '@churchos/auth';

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      actor?: Actor | null;
      headers: Record<string, string | string[] | undefined>;
    }>();
    const auth = request.headers['authorization'] as string | undefined;
    if (auth?.startsWith('Bearer ')) {
      const b64 = auth.slice(7).trim();
      try {
        const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
        const json = Buffer.from(padded, 'base64').toString('utf8');
        const payload = JSON.parse(json) as { sub?: string; permissions?: string[] };
        if (payload.sub && Array.isArray(payload.permissions)) {
          request.actor = {
            id: String(payload.sub),
            permissions: payload.permissions as Actor['permissions'],
          };
          return true;
        }
      } catch {}
    }
    const mock = request.headers['x-mock-permissions'] as string | undefined;
    if (mock !== undefined) {
      const permissions = mock
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean) as Actor['permissions'];
      const userId = (request.headers['x-mock-user'] as string | undefined) ?? 'mock-user';
      request.actor = { id: String(userId), permissions };
      return true;
    }
    request.actor = null;
    return true;
  }
}
