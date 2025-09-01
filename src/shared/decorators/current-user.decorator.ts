import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
