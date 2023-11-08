import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  public readonly prisma: PrismaClient;
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  // async findUserById(userId: number) {
  //   console.log("INSIDE FINDUSERBYID USER : ");

  //   try {
  //       const users = await this.prisma.user.findMany();
  //       console.log("PRINTIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIING USER : ", users);
  //       console.log("PRINTIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIING USER : ");
  //     return await this.prisma.user.findUnique({
  //       where: {
  //         fortytwo_id: userId,
  //       },
  //     });
  //   } catch (error) {
  //     console.log("no user found");
  //   }
  // }
}
