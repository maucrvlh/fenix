import { Module } from '@nestjs/common';
import { GabaritoService } from './gabarito.service';
import { GabaritoController } from './gabarito.controller';
import { RepositorioModule } from '../repositorio/repositorio.module';

@Module({
  imports: [RepositorioModule],
  controllers: [GabaritoController],
  providers: [GabaritoService],
})
export class GabaritoModule {}
