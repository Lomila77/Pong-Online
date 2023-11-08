import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Get('/profil')
  getProfil(@GetUser() user: User) {
    return this.userService.profil(user);
  }

  @Get('/all')
  getUsers() {
    return this.userService.getUsers();
  }
}
