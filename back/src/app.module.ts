import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TwofaModule } from './twofa/twofa.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UserModule,
    ConfigModule.forRoot({
      // envFilePath: '../../.env',
      isGlobal: true,
    }),
    TwofaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
