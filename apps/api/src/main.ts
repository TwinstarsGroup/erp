import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.enableCors({
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
  });

  const PgSession = connectPgSimple(session as any);
  const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });

  app.use(
    session({
      store: new PgSession({ pool: pgPool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || 'fallback_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    } as any),
  );

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
