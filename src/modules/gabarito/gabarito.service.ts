import { Injectable } from '@nestjs/common';
import { CreateUpdateGabaritoDto } from './dto/create-gabarito.dto';
import { RepositorioService } from '../repositorio/repositorio.service';

@Injectable()
export class GabaritoService {
  constructor(private repositorio: RepositorioService) {}

  async createOrUpdate(createGabaritoDto: CreateUpdateGabaritoDto) {
    await this.repositorio.updateGabarito(createGabaritoDto);
  }

  async findAll() {
    return this.repositorio.getGabarito();
  }

  async deleteAll() {
    await this.repositorio.updateGabarito({ respostas: [] });
  }
}
