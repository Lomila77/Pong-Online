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

  profil(user: User) {
    return {
      data: {
        pseudo: user.pseudo,
        avatar: user.avatar,
        isF2Active: user.isF2Active,
      },
    };
  }

  getUsers() {
    return this.prisma.user.findMany();
  }
}
