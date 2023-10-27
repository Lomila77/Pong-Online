import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          pseudo: dto.pseudo,
          isF2Active: dto.isF2Active,
        },
      });
      return this.signToken(user.fortytwo_id, user.pseudo);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signgin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        pseudo: dto.pseudo,
      },
    });
    if (!user) throw new ForbiddenException('Credential incorrect');
    return this.signToken(user.fortytwo_id, user.pseudo);
  }

  async signToken(
    userFortytwo_id: number,
    pseudo: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userFortytwo_id,
      pseudo,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
    return {
      access_token: token,
    };
  }
}
