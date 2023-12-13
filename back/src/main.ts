import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { join } from 'path';
import * as express from 'express';

dotenv.config();
// configurePassport(passport);

function checkIfAllowed(ipAddress: string): boolean {
  // Votre logique de vérification ici
  // Par exemple, vous pouvez comparer l'adresse IP avec une liste d'adresses IP autorisées

  const allowedIPs = ['192.168.0.100', '10.0.0.1', '...']; // Liste des adresses IP autorisées

  return allowedIPs.includes(ipAddress);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Middleware function to access the request object
      app.use((req, res, next) => {
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        // Vérifier si l'adresse IP est autorisée
        const isAllowed = checkIfAllowed(ipAddress);
        if (isAllowed) {
          callback(null, origin);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      });
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };
  app.enableCors(corsOptions);
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    );
    // res.header('Access-Control-Allow-Credentials', 'true');
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
        sameSite: 'lax',
        // secure: true,
        signed: true,
      },
      name: app.get(ConfigService).get<string>('COOKIES_NAME'),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser());
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(app.get(ConfigService).get<number>('BACK_PORT'));
}
bootstrap();
