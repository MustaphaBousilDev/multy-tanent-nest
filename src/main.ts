import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(':tenant?/api'); // myapi.com/company1/api/users(or ...)
  await app.listen(AppModule.port);
}
bootstrap();
