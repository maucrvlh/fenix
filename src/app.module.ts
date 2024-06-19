import { Module } from '@nestjs/common';
import { AvaliacaoModule } from './modules/avaliacao/avaliacao.module';
import { GabaritoModule } from './modules/gabarito/gabarito.module';
import { RepositorioModule } from './modules/repositorio/repositorio.module';
import { ConfigModule } from '@nestjs/config';
import envSchema from './env-schema';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    AvaliacaoModule,
    GabaritoModule,
    RepositorioModule,
  ],
})
export class AppModule {}
