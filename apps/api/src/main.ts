process.env.TZ = 'America/Sao_Paulo';
import "./instrument";
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import 'class-validator';
import 'class-transformer';

import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      rawBody: true,
      bodyParser: false
    }
  );
  app.setGlobalPrefix('api');

  // Confiar no proxy reverso (Nginx) para identificar o IP real do cliente
  (app.getHttpAdapter().getInstance() as any).set('trust proxy', 1);

  // Aumentar o limite de payload para imagens Base64
  const express = require('express');

  // LOG DE TODAS AS REQUISIÇÕES (PARA DEBUG)
  app.use((req: any, res, next) => {
    const url = req.originalUrl || req.url;
    // Logamos apenas um resumo para não inundar os logs, mas pegamos tudo do Stripe
    if (url?.includes('stripe/webhook')) {
      console.log(`[STRIPE ATTEMPT] matched ${url}`);
      return express.raw({ type: '*/*' })(req, res, next);
    }
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS — deve vir ANTES de qualquer outro middleware
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3005',
      'http://localhost:3006',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3005',
      'http://127.0.0.1:3006',
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With', 'Origin'],
  });

  app.use(cookieParser());
  app.use(helmet({
    contentSecurityPolicy: {
      reportOnly: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.FRONTEND_URL].filter(Boolean) as string[],
      },
    },
  }));

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    errorHttpStatusCode: 400,
    exceptionFactory: (errors) => {
      const formattedErrors = errors.map((err) => {
        const constraints = err.constraints || {};
        const messages = Object.values(constraints).map((msg: string) => {
          return msg
            .replace('should not exist', 'não deve existir')
            .replace('must be a number', 'deve ser um número')
            .replace('must be a string', 'deve ser uma string')
            .replace('must be a valid ISO 8601 date string', 'deve ser uma data válida (ISO 8601)')
            .replace('must be a UUID', 'deve ser um UUID válido')
            .replace('should not be empty', 'não deve estar vazio')
            .replace('must be an email', 'deve ser um e-mail válido')
            .replace('must be longer than or equal to', 'deve ter no mínimo')
            .replace('must be shorter than or equal to', 'deve ter no máximo')
            .replace('characters', 'caracteres')
            .replace('property ', 'A propriedade ');
        });
        return {
          field: err.property,
          errors: messages,
        };
      });
      return new (require('@nestjs/common').BadRequestException)(formattedErrors);
    },
  }));

  const port = process.env.PORT || 3006;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend rodando em http://localhost:${port}`);
}
bootstrap();
