import { backResInterface } from './../shared/shared.interface';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
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
  async getUsers() {
    return this.userService.getUsers();
  }

  @Get('/checkpseudo/:pseudo')
  // async checkpseudo(@Param('pseudo') pseudo: string) {
  //   return this.userService.checkPseudo(pseudo)
  // }
  async checkpseudo(@Body() body: backResInterface) {
    return this.userService.checkPseudo(body.pseudo)
  }

  @Get('/del/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delId(id)
  }
  @Get('/gnr')
  async generate() {
    return await this.userService.generateRdn();
  }

  @Get('/clear')
  async clear() {
    return await this.userService.deleteAllUsers();
  }
  @Get('/print')
  async print() {
    return await this.userService.print();
  }
}
