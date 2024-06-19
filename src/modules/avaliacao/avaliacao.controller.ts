import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AvaliacaoService } from './avaliacao.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Controller({ version: '1', path: 'avaliacao' })
export class AvaliacaoController {
  constructor(private readonly avaliacaoService: AvaliacaoService) {}

  @Throttle({ default: { limit: 5, ttl: 6000 } })
  @Post()
  create(@Body() createAvaliacaoDto: CreateAvaliacaoDto) {
    return this.avaliacaoService.createOrUpdate(createAvaliacaoDto);
  }

  @Throttle({ default: { limit: 10, ttl: 5000 } })
  @Get()
  async findByCriteria(
    @Query() query: { idTurma?: string; idAluno?: string } = {},
  ) {
    const result = await this.avaliacaoService.findByCriteria(query);
    if (!result.length) {
      throw new NotFoundException('Nenhuma avaliação encontrada.');
    }
    return result;
  }

  @Get('consolidado/:idTurma')
  async consolidate(@Param('idTurma', ParseIntPipe) idTurma: number) {
    const result = await this.avaliacaoService.consolidate(idTurma);
    if (!result) {
      throw new NotFoundException('Nenhuma avaliação encontrada para a turma.');
    }
    return result;
  }

  @Delete()
  async deleteAll() {
    await this.avaliacaoService.deleteAll();
  }
}
