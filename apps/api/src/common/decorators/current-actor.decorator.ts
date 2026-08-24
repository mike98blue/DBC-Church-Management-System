import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Actor } from '@churchos/auth';

export const CurrentActor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Actor | null => {
    const request = ctx.switchToHttp().getRequest<{ actor?: Actor | null }>();
    return request.actor ?? null;
  },
);
