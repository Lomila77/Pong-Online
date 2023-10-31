import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, Fortytwo_dto } from './dto';
import { ApiAuthGuard } from './guard/ft_api.guard';
import { GetUser } from './decorator/get-user.decorator';
import { JwtGuard } from './guard';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/callback')
  @UseGuards(ApiAuthGuard)
  signin(@Req() req: {user: Fortytwo_dto}) {
    return this.authService.handleIncommingUser(req.user);
  }

// element here for debug need to delete in before correction
  @Get('prisma')
  prismaPrintTable(){
    this.authService.prismaPrintTable();
    return true;
  }


  @Get('/is2FA')
  @UseGuards(JwtGuard)
  is2FA(@GetUser() user: User) {
    return user.isF2Active;
  }

  @Get('/twoFA')
  @UseGuards(JwtGuard)
  twoFA(@GetUser() user: User) {
    return this.authService.twoFA(user);
  }

  @UseGuards(JwtGuard)
  @Get('/verify')
  verify(@GetUser() user: User, code: string) {
    return this.authService.verify(user, code);
  }

  // @Post('signup')
  // signup(@Body() dto: AuthDto) {
  //   return this.authService.signup(dto);
  // }

  // @Post('signin')
  // signin(@Body() dto: AuthDto) {
  //   return this.authService.signin(dto);
  // }
}
