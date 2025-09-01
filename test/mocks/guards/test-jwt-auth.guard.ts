import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class TestJwtAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const request: Request = ctx.switchToHttp().getRequest();
    request.user = { sub: '123456789', username: 'tester' };
    return true;
  }
}
