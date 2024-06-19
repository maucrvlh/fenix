import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { memory } from './modules/repositorio/memory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe());

  function writeFileMemory() {
    app.close();
    const memoryToSave = {
      ...memory,
      avaliacoes: Array.from(memory.avaliacoes, ([, value]) => value),
    };
    writeFileSync(
      process.env.DATABASE_FILE,
      JSON.stringify(memoryToSave, null, 2),
    );
  }

  process.on('SIGBREAK', writeFileMemory);

  process.on('SIGINT', writeFileMemory);

  process.on('SIGQUIT', writeFileMemory);

  process.on('SIGTERM', writeFileMemory);

  process.on('uncaughtException', function (error) {
    console.error(error);
    writeFileMemory();
    process.exit(1);
  });

  await app.listen(3000);
}

bootstrap();
