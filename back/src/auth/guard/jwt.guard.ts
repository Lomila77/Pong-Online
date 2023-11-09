import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    super({
      //overload of the way to get the token
      jwtGuardwtFromRequest: (request: Request) => {
        return request.cookies.jwtToken;
      },
    });
  }
}
