import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getUserbyId(userId:number): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        fortytwo_id: userId
      },
    });
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
}
