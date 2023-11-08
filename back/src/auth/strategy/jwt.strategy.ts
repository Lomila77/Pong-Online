import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request:Request) => {
          console.log("inside JWTSTRATEGY request", request.cookies);
          return request.cookies.jwtToken;
        }
      ]),
      secretOrKey: config.get('JWT_SECRET'),
    });
    console.log('we are in validate, JwtStrategy');

  }

  async validate(payload: { sub: number; email: string }) {
    console.log('we are in validate, JwtStrategy');
    const user = await this.prisma.user.findUnique({
      where: {
        fortytwo_id: payload.sub,
      },
    });
    return user;
  }
}
