import { backResInterface } from './../shared/shared.interface';
import { IsBoolean } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

interface userUpdate {
  pseudo: string;
  avatar: string;
  isF2Active: boolean;
}

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

  async updateUser(userId: number, update: userUpdate) {
    try {
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
        data: {
          pseudo: user.pseudo,
          avatar: user.avatar,
          isF2Active: user.isF2Active,
        },
      }
    } catch (error){
      console.log("Error user service: ", error);
      throw error;
    }
  }

  async checkPseudo(userPseudo: string) : Promise<backResInterface> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          pseudo: userPseudo,
        },
      })
      if (user) {
        return {isOk: false,}
      }
      return  { isOk: true,}
      //return true
    } catch(error) {
      console.log("Error user service: ", error);
      throw error;
    }
  }

  profil(user: User) {
    return {
      data: {
        pseudo: user.pseudo,
        avatar: user.avatar,
        isF2Active: user.isF2Active,
      },
    };
  }

  async getUsers() {
    return this.prisma.user.findMany();
  }

  async getUser(username: string) {
    return this.prisma.user.findUnique({
      where: {
        fortytwo_userName: username
      }
    });
  }

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
