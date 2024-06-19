import { Injectable } from '@nestjs/common';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { RepositorioService } from '../repositorio/repositorio.service';
import { TGabarito } from 'src/types/gabarito.type';

@Injectable()
export class AvaliacaoService {
  constructor(private repositorio: RepositorioService) {}

  private toPercentual(value: number) {
    return parseFloat((value * 100).toFixed(2));
  }

  private toMedia(value: number) {
    return parseFloat(value.toFixed(2));
  }

  private calculateAvaliacao(gabarito: TGabarito, respostas: string[]) {
    const respostasLimitadas = respostas.slice(0, gabarito.respostas.length);
    let respostasValidas = 0;
    let respostasCertas = 0;
    let respostasErradas = 0;
    let respostasValidasEmBranco = 0;
    for (let i = 0; i < gabarito.respostas.length; i++) {
      if (gabarito.respostas[i] === '') continue;
      respostasValidas++;
      if (respostasLimitadas[i] === gabarito.respostas[i]) respostasCertas++;
      else if (
        respostasLimitadas[i] &&
        respostasLimitadas[i] !== gabarito.respostas[i] &&
        respostasLimitadas[i] !== ''
      )
        respostasErradas++;
      else respostasValidasEmBranco++;
    }

    const respostasNaoIdentificadas = Math.max(
      0,
      respostasValidas - respostas.length,
    );
    const respostasEmBranco =
      respostasValidasEmBranco + respostasNaoIdentificadas;
    return {
      respostasCertas,
      respostasErradas,
      respostasEmBranco: respostasEmBranco,
      percentualDeAcerto: this.toPercentual(respostasCertas / respostasValidas),
      percentualDeErro: this.toPercentual(respostasErradas / respostasValidas),
      percentualDeRespostasEmBranco: this.toPercentual(
        respostasEmBranco / respostasValidas,
      ),
    };
  }

  async createOrUpdate(createAvaliacaoDto: CreateAvaliacaoDto) {
    await this.repositorio.insertAvaliacao(createAvaliacaoDto);
    const gabarito = await this.repositorio.getGabarito();
    return this.calculateAvaliacao(gabarito, createAvaliacaoDto.respostas);
  }

  async findByCriteria(query: { idTurma?: string; idAluno?: string }) {
    const [gabarito, avaliacoes] = await Promise.all([
      this.repositorio.getGabarito(),
      this.repositorio.getAvaliacoes(
        Object.keys(query).length === 0
          ? {}
          : { idTurma: Number(query.idTurma), idAluno: Number(query.idAluno) },
      ),
    ]);
    return avaliacoes.map((avaliacao) => ({
      ...avaliacao,
      avaliacao: this.calculateAvaliacao(gabarito, avaliacao.respostas),
    }));
  }

  async findByAlunoId(idAluno: number) {
    return await this.repositorio.getAvaliacoes({ idAluno });
  }

  async consolidate(idTurma: number) {
    const [avaliacoes, gabarito] = await Promise.all([
      this.repositorio.getAvaliacoes({ idTurma }),
      this.repositorio.getGabarito(),
    ]);

    if (avaliacoes.length === 0) return null;
    let percentualDeAcertoConsolidado = 0;
    let percentualDeErroConsolidado = 0;
    let percentualDeRespostasEmBranco = 0;
    for (const avaliacao of avaliacoes) {
      const report = this.calculateAvaliacao(gabarito, avaliacao.respostas);
      percentualDeAcertoConsolidado += report.percentualDeAcerto;
      percentualDeErroConsolidado += report.percentualDeErro;
      percentualDeRespostasEmBranco += report.percentualDeRespostasEmBranco;
    }
    return {
      percentualDeAcerto: this.toMedia(
        percentualDeAcertoConsolidado / avaliacoes.length,
      ),
      percentualDeErro: this.toMedia(
        percentualDeErroConsolidado / avaliacoes.length,
      ),
      percentualDeRespostasEmBranco: this.toMedia(
        percentualDeRespostasEmBranco / avaliacoes.length,
      ),
    };
  }

  async deleteAll() {
    await this.repositorio.deleteAll();
  }
}
