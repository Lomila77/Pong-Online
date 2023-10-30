import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { HttpService } from '@nestjs/axios';
import { AuthDto } from '../dto/auth.dto';
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

  async validate(accessToken: string, refreshToken: string): Promise<any> {
    try {
      const ret: AxiosResponse<AuthDto, any> = await this.httpService
        .get('https://api.intra.42.fr/v2/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .toPromise();
      // console.log(ret.data.image)
      return await this.authservice.handleApiRet(ret);
    } catch (error) {
      throw error;
    }
  }
}
