import { Controller, Post, Body, Get, UseGuards, Delete } from '@nestjs/common';
import { GabaritoService } from './gabarito.service';
import { CreateUpdateGabaritoDto } from './dto/create-gabarito.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Controller({ version: '1', path: 'gabarito' })
export class GabaritoController {
  constructor(private readonly gabaritoService: GabaritoService) {}

  @Throttle({ default: { limit: 5, ttl: 6000 } })
  @Post()
  createOrUpdate(@Body() createUpdateGabaritoDto: CreateUpdateGabaritoDto) {
    return this.gabaritoService.createOrUpdate(createUpdateGabaritoDto);
  }

  @Get()
  findAll() {
    return this.gabaritoService.findAll();
  }

  @Delete()
  async deleteAll() {
    await this.gabaritoService.deleteAll();
  }
}
