
import { frontReqInterface, backResInterface } from './../shared/shared.interface';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { UserService } from './user.service';


@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/me')
  @UseGuards(JwtGuard)
  getMe(@GetUser() user: User) {
    return user;
  }

  @Get('/profil')
  @UseGuards(JwtGuard)
  getProfil(@GetUser() user: User) {
    return this.userService.profil(user);
  }

  @Get('/all')
  @UseGuards(JwtGuard)
  async getUsers() {
    return this.userService.getUsers();
  }

  @Put('/checkpseudo')
  async checkpseudo(@Body() body: frontReqInterface) {
    return this.userService.checkPseudo(body.pseudo)
  }

  @Post('update')
  @UseGuards(JwtGuard)
  async settingslock(
    @Body() body: frontReqInterface,
    @GetUser() user: User,
  ) {
      return await this.userService.updateUser(user.fortytwo_id, body)
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
