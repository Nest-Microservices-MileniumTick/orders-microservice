import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ENV } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
   const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      port: ENV.PORT
    }
  });

  const logger = new Logger('Main')

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }))

  await app.listen();

  logger.log(`Orders microservice running on port ${ENV.PORT}`)
}

bootstrap();
