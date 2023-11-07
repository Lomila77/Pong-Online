import { PrismaService } from 'src/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
import { Fortytwo_dto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import {Request, Response} from 'express';
import { UserService } from 'src/user/user.service';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private user: UserService,
  ) {}
  async handleIncommingUser (incommingUser: Fortytwo_dto, res:Response){
    let firstConnection: boolean = true;
    const prismaRet = await this.user.getUserbyId(incommingUser.id);
    // const prismaRet = await this.prisma.user.findUnique({
    //   where: {
    //     fortytwo_id: incommingUser.id,
    //   },
    // });

    if (!prismaRet) {
      await this.signup(incommingUser);
    }
    else if (prismaRet.pseudo !== "") {
      await this.prisma.user.update({
        where: {
          fortytwo_id: incommingUser.id,
        },
        data: {
          connected: true,
        }
      });
      firstConnection = false;
    }
    const token = await this.signToken(incommingUser.id, incommingUser.email, firstConnection)
    res.cookie('jwtToken', token);
    return firstConnection;
  }

  async signup(incommingUser: Fortytwo_dto) {
    try {
      const user: User = await this.prisma.user.create({
        data: {
          fortytwo_id: incommingUser.id,
          fortytwo_email: incommingUser.email,
          fortytwo_userName: incommingUser.login,
          fortytwo_picture: incommingUser.image[1]?.value || null,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException('signup : Credentials taken');
      }
      throw error;
    }
  }

  async prismaPrintTable() {
    try {
      const users = await this.prisma.user.findMany();
      console.log(users);
    } catch (error) {
      console.error(error);
    }
  }

  async signToken(userId: number, email: string, firstConnection: boolean,): Promise<{ access_token: string }>
  {
    let validityTime: string;
    switch (firstConnection) {
      case true:
        validityTime = '5m'
        break;
      case false:
        validityTime = '120m'
        break;
    }
    const data = {
      sub: userId,
      email: email,
    };
    const secret = process.env.JWT_SECRET;
    const token = await this.jwt.signAsync(data, {
      expiresIn: validityTime,
      secret: secret,
    });
    return { access_token: token };
  }

  async logout(req: Request, res: Response, user: User): Promise<void> {
    if (user) {
      await this.prisma.user.update({
        where: {
          fortytwo_id: user.fortytwo_id,
        },
        data: {
          connected: false,
        }
      });
    }
    res.clearCookie(process.env.COOKIES_NAME)
    // console.log(req.user)
    // console.log("session ID (logout)", req.sessionID)
    // console.log("logout called");
    // console.log("req bool: ", !!req.isAuthenticated());
    // console.log("session id: ", req.sessionID);
    // console.log("req.user: ", req.user);
    req.logout((err) => {
      if (err) {
        return res.status(500).send('Logout error');
      }
      else {
        console.log("req bool after logout: ", !!req.isAuthenticated());
        res.status(200).json({success: true, messge: "Deconnected"});
        // res.redirect(`http://localhost:${process.env.FRONT_PORT}/login`);
      }
    })
  }

  twoFA(user: User) {
    const secret = speakeasy.generateSecret({
      name: user.pseudo,
    });
    user.secretOf2FA = secret.base32;
    qrcode.toDataURL(secret.otpauth_url, function (err) {
      if (err) throw err;
    });
    return secret.otpauth_url;
  }

  verify(user: User, code: string) {
    return speakeasy.totp.verify({
      secret: user.secretOf2FA,
      encoding: 'base32',
      token: code,
    });
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
