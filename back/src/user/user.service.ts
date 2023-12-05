import { backResInterface, frontReqInterface } from './../shared/shared.interface';
import { validate } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckPseudoDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserbyId(userId: number): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: {
          fortytwo_id: userId,
        },
      });
    } catch (error) {
      console.log('Error user service: ', error);
      throw error;
    }
  }

  async toggleConnectionStatus(userId: number, status: boolean) {
    try {
      return await this.prisma.user.update({
        where: {
          fortytwo_id: userId,
        },
        data: {
          connected: status,
        },
      });
    } catch (error) {
      console.log('Error user service: ', error);
      throw error;
    }
  }

  async updateUser(userId: number, update: frontReqInterface) :Promise<backResInterface>{
    try {
      // if ((await this.checkPseudo(update.pseudo)).isOk)
      //   return {isOk: false}
      const user = await this.prisma.user.update({
        where: {
          fortytwo_id: userId,
        },
        data: {
          pseudo: update.pseudo,
          avatar: update.avatar,
          isF2Active: update.isF2Active,
        }
      })
      return {
          pseudo: user.pseudo,
          avatar: user.avatar,
          isF2Active: user.isF2Active,
          isOk: true,
          isAuthenticated: user.connected,
      }
    } catch (error){
      console.log("Error user service: ", error);
      throw new error;
    }
  }

  /* reminder :
     here we are declaring an objet and me mandatory tell ts that its type is CheckPseudoDto
     const pseudoDto : CheckPseudoDto = {pseudo : inputPseudo};
     here we are declaring an instant thus validate will work on it
     let pseudoDto = new CheckPseudoDto
  */
  async checkPseudo(inputPseudo: string) : Promise<backResInterface> {
    try {
      const pseudoDto = new CheckPseudoDto;
      pseudoDto.pseudo = inputPseudo;
      const errors = await validate(pseudoDto);

      if (errors.length > 0)
          return {isOk: false, message: Object.values(errors[0].constraints)[0]};
      const user = await this.prisma.user.findFirst({
        where: {
          pseudo: pseudoDto.pseudo,
        },
      });
      return user ? {isOk: false, message: "credential is taken"}
                  : {isOk: true}
    } catch(error) {
      console.log("Error user service: ", error);
      return {isOk: false, message: error.message};
    }
  }

  async isFriend(me: User, friendPseudo: string): Promise<backResInterface> {
    const meFriends = (await this.prisma.user.findUnique({
      where: { fortytwo_id: me.fortytwo_id},
      select: { friends: true}
    })).friends;
    const friendId = (await this.prisma.user.findFirst({
      where: { pseudo: friendPseudo, },
      select: { fortytwo_id: true}
    })).fortytwo_id;
    if (!meFriends?.find(meFriend => meFriend === friendId) && me.fortytwo_id != friendId)
      return {isFriend: false};
    return {isFriend: true};
  }

  profil(user: User) : backResInterface{
    return {
        fortytwo_id: user.fortytwo_id,
        pseudo: user.pseudo,
        avatar: user.avatar,
        isF2Active: user.isF2Active,
        isOk: true,
        isAuthenticated: user.connected,
    }
  }

  async getUser(userPseudo: string) {
    return this.prisma.user.findFirst({
      where: {
        pseudo: userPseudo,
      }
    })
  }

  async getUsers(): Promise<backResInterface> {
    return {allUser: await this.prisma.user.findMany()};
  }

  //async getUser(username: string) {
  //  return this.prisma.user.findUnique({
  //    where: {
  //      fortytwo_userName: username
  //    }
  //  });
 // }

  // this function is meant to be deleted before correction.


  async delId(userId: number) {
    try {
      await this.prisma.user.delete({
        where: {
          fortytwo_id: userId,
        }
      })
      return "successfully deleting userId: " + userId
    }
    catch (error) {
      console.log("Error user service: delMe ", error);
      throw error;
    }
  }

  async deleteAllUsers() {
    try {
      const deleteResult = await this.prisma.user.deleteMany({
        where: {
          fortytwo_id: {
            lt: 20,
          }
        }
      });
      console.log(`Suppression réussie de ${deleteResult.count} utilisateurs.`);
      const users = await this.prisma.user.findMany();
      console.log(users);
      return users;
    } catch (error) {
      console.error('Erreur lors de la suppression des utilisateurs :', error);
    }
  }

  async print() {
    try {
      const users = await this.prisma.user.findMany();
      console.log("****** PRINTING ALL USERS ******\n", users);
      return users;
    } catch (error) {
      console.error(error);
    }
  }
}
