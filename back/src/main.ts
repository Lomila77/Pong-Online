import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as session from 'express-session';
import * as passport from 'passport';
import { configurePassport } from './config/passport.config';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { WsAdapter } from '@nestjs/platform-ws';

dotenv.config();
// configurePassport(passport);
console.log(process.env.DATABASE_URL);
console.log(process.env.DATABASE_URL);
console.log(process.env.COOKIES_SECRET_KEY);
console.log(process.env.POSTGRES_USER);
console.log(process.env.POSTGRES_PASSWORD);
console.log(process.env.POSTGRES_DB);
console.log(process.env.DB_PORT);
console.log(process.env.BACK_PORT);
console.log(process.env.FRONT_PORT);
console.log(process.env.DATABASE_URL);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const corsOptions: CorsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
  app.enableCors(corsOptions);
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    );
    next();
  });

  app.use(
    session({
      secret: app.get(ConfigService).get<string>('COOKIES_SECRET_KEY'),
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        maxAge: 3600000,
        sameSite: 'strict',
        signed: true,
      },
      name: app.get(ConfigService).get<string>('COOKIES_NAME'),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(app.get(ConfigService).get<number>('BACK_PORT'));
}
bootstrap();
