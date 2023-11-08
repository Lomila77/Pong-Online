import { Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

export class JwtGuard extends AuthGuard('jwt') {

  constructor() {
    super({
        jwtGuardwtFromRequest: (request: Request) => {
        return request.cookies.jwtToken;
        },
    });
  }
}
