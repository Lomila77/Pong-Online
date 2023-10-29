import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//Guards are routes protectors.
// here We grab the request in order to check via a Passport.js methode if its authentificate or not
@Injectable()
export class ApiAuthGuard extends AuthGuard('ft_api') {
  async canActivate(context: ExecutionContext) {
    const activate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return request.isAuthenticated();
  }
}
