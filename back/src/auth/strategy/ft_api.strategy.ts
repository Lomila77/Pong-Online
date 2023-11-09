import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { HttpService } from '@nestjs/axios';
import { Fortytwo_dto } from '../dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class ApiStrategy extends PassportStrategy(OAuth2Strategy, 'ft_api') {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly authservice: AuthService,
  ) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.UID,
      clientSecret: process.env.API_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ['public'],
    });
  }

  async validate(accessToken: string): Promise<Fortytwo_dto> {
    try {
      const response = await lastValueFrom(
        this.httpService.get('https://api.intra.42.fr/v2/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }).pipe(
          map((res) => res.data)
        )
      );
      const userDto: Fortytwo_dto = {
        id: response.id,
        login: response.login,
        email: response.email,
        image: response.image,
      };
      console.log(userDto.email);
      console.log(userDto.id);
      console.log(userDto.login);
      console.log(userDto.image);
      return userDto;
    } catch (error) {
      throw error;
    }
  }
}
