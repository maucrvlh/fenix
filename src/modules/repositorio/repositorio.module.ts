import { Module } from '@nestjs/common';
import { RepositorioService } from './repositorio.service';

@Module({
  providers: [RepositorioService],
  exports: [RepositorioService],
})
export class RepositorioModule {}
