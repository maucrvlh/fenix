import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { memory } from '../repositorio/memory';
import { TAvaliacao } from 'src/types/avaliacao.type';
import { TGabarito } from 'src/types/gabarito.type';
import { TRepositorio } from 'src/types/repositorio.type';

@Injectable()
export class RepositorioService {
  private db = memory;
  constructor() {
    this.initDatabase();
  }
  private getId(avaliacao: TAvaliacao) {
    return String(avaliacao.idAluno)
      .concat('-')
      .concat(String(avaliacao.idTurma));
  }

  private async initDatabase() {
    const rawData = readFileSync(process.env.DATABASE_FILE, 'utf8');
    const loadedData = JSON.parse(rawData) as TRepositorio;
    this.db.gabarito.respostas = loadedData.gabarito.respostas;
    loadedData.avaliacoes.forEach((avaliacao) =>
      this.db.avaliacoes.set(
        String(avaliacao.idAluno).concat('-').concat(String(avaliacao.idTurma)),
        avaliacao,
      ),
    );
  }

  async getGabarito() {
    return this.db.gabarito;
  }
  async updateGabarito(gabarito: TGabarito) {
    this.db.gabarito.respostas = gabarito.respostas;
  }

  async insertAvaliacao(avaliacao: TAvaliacao) {
    this.db.avaliacoes.set(this.getId(avaliacao), avaliacao);
  }
  async getAvaliacoes(filter: { idTurma?: number; idAluno?: number } = {}) {
    const toArray = Array.from(this.db.avaliacoes, ([, value]) => value);
    if (Object.keys(filter).length === 0) return toArray;
    return toArray.filter((avaliacao) => {
      if (filter.idAluno && avaliacao.idAluno !== filter.idAluno) return false;
      if (filter.idTurma && avaliacao.idTurma !== filter.idTurma) return false;
      return true;
    });
  }
  async deleteAll() {
    this.db.avaliacoes.clear();
  }
}
