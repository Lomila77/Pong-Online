import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { ApiStrategy, JwtStrategy } from './strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'ft_api', session: true }),
    JwtModule.register({}),
    PrismaModule,
    HttpModule,
  ],

  controllers: [
    AuthController
  ],

  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    ApiStrategy],
})
export class AuthModule {}
