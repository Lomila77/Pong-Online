import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { HttpService } from '@nestjs/axios';
import { AuthDto, Fortytwo_dto } from '../dto/auth.dto';
import { AxiosResponse } from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

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
      clientID: config.get('UID'),
      clientSecret: config.get('API_SECRET'),
      callbackURL: 'http://localhost:3333/auth/callback',
      scope: ['public'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile:AuthDto): Promise<Fortytwo_dto> {
    try {
      console.log("access token: ", accessToken);
      console.log("refreshToken: ", refreshToken);
      console.log("profile: ", profile);

      const  {data} : AxiosResponse<Fortytwo_dto, any> = await this.httpService
        .get('https://api.intra.42.fr/v2/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .toPromise();
      console.log(data.id);
      const userDto: Fortytwo_dto = {
        id: data.id,
        login: data.login,
        email: data.email,
        image: data.image,
      }
      console.log("id: ", userDto.id);
      console.log("login: ", userDto.login);
      console.log("email: ", userDto.email);
      console.log("image: ", userDto.image);
      console.log("image: leaving strategy");
      return userDto || null; // demander a gpt si null est utile ici
    } catch (error) {
      throw error;
    }
  }
}
