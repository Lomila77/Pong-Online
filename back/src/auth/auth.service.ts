import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { User } from '@prisma/client';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async handleApiRet(apiRet: AxiosResponse<AuthDto, any>) {
    const incommingUser = apiRet.data;
    console.log(incommingUser.id)
    console.log(incommingUser.login)
    console.log(incommingUser.email)
    const prismaRet = await this.prisma.user.findUnique({
      where: {
        fortytwo_id: incommingUser.id,
      },
    });
    if (!prismaRet)
      this.signup(incommingUser);
    return incommingUser;
  }

  async signup(dto: AuthDto) {
    //save the new user in the db
    try {
      const user: User = await this.prisma.user.create({
        data: {
          fortytwo_id: dto.id,
          fortytwo_email: dto.email,
          fortytwo_userName: dto.login,
          fortytwo_picture: dto.image.link,
          pseudo: dto.pseudo,
          isF2Active: dto.isF2Active,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        fortytwo_id: dto.id,
      },
    });
    // find except
    if (!user) throw new ForbiddenException('Credentials incorrect');
    return this.signToken(user.fortytwo_id, user.fortytwo_email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const data = {
      sub: userId,
      email: email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(data, {
      expiresIn: '15m',
      secret: secret,
    });
    return { access_token: token };
  }
}

// async postPseudo(dto: AuthDto) {
//   try {
//     const user = await this.prisma.user.create({
//       data: {
//         pseudo: dto.pseudo,
//         isF2Active: dto.isF2Active,
//         avatar: dto.avatar,
//       },
//     });
//     console.log('SUCCESS');
//     return this.signToken(user.fortytwo_id, user.pseudo);
//   } catch (error) {
//     if (error instanceof PrismaClientKnownRequestError) {
//       if (error.code === 'P2002') {
//         throw new ForbiddenException('Credentials taken');
//       }
//     }
//     throw error;
//   }
// }

//   async signgin(dto: AuthDto) {
//     const user = await this.prisma.user.findUnique({
//       where: {
//         pseudo: dto.pseudo,
//       },
//     });
//     if (!user) throw new ForbiddenException('Credential incorrect');
//     return this.signToken(user.fortytwo_id, user.pseudo);
//   }

//   async signToken(
//     userFortytwo_id: number,
//     pseudo: string,
//   ): Promise<{ access_token: string }> {
//     const payload = {
//       sub: userFortytwo_id,
//       pseudo,
//     };
//     const secret = this.config.get('JWT_SECRET');
//     const token = await this.jwt.signAsync(payload, {
//       expiresIn: '15m',
//       secret: secret,
//     });
//     return {
//       access_token: token,
//     };
//   }
// }
