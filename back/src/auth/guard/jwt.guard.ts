import { Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

export class JwtGuard extends AuthGuard('jwt') {

  constructor() {
    super({
        jwtGuardwtFromRequest: (request: Request) => {
        console.log("JwtGuard IS PRINTING: ", request.cookies);
        return request.cookies.jwtToken;
        },
    });
  }
}
