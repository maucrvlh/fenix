import { Test, TestingModule } from '@nestjs/testing';
import { AvaliacaoService } from './avaliacao.service';
import { ConfigModule } from '@nestjs/config';
import { RepositorioService } from '../repositorio/repositorio.service';

describe('AvaliacaoService', () => {
  let service: AvaliacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
        }),
      ],
      providers: [AvaliacaoService, RepositorioService],
    }).compile();

    service = module.get<AvaliacaoService>(AvaliacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate avaliacao', () => {
    const gabarito = { respostas: ['A', 'B', 'C'] };
    const respostas = ['A', 'B', 'C'];
    const avaliacao = service['calculateAvaliacao'](gabarito, respostas);
    expect(avaliacao).toEqual({
      respostasCertas: 3,
      respostasErradas: 0,
      respostasEmBranco: 0,
      percentualDeAcerto: 100,
      percentualDeErro: 0,
      percentualDeRespostasEmBranco: 0,
    });
  });

  it('should calculate avaliacao with wrong answers', () => {
    const gabarito = { respostas: ['A', 'B', 'C'] };
    const respostas = ['A', 'B', 'D'];
    const avaliacao = service['calculateAvaliacao'](gabarito, respostas);
    expect(avaliacao).toEqual({
      respostasCertas: 2,
      respostasErradas: 1,
      respostasEmBranco: 0,
      percentualDeAcerto: 66.67,
      percentualDeErro: 33.33,
      percentualDeRespostasEmBranco: 0,
    });
  });

  it('should calculate avaliacao with blank answers', () => {
    const gabarito = { respostas: ['A', 'B', 'C'] };
    const respostas = ['A', '', ''];
    const avaliacao = service['calculateAvaliacao'](gabarito, respostas);
    expect(avaliacao).toEqual({
      respostasCertas: 1,
      respostasErradas: 0,
      respostasEmBranco: 2,
      percentualDeAcerto: 33.33,
      percentualDeErro: 0,
      percentualDeRespostasEmBranco: 66.67,
    });
  });

  it('should ignore extra answers', () => {
    const gabarito = { respostas: ['A', 'B', 'C'] };
    const respostas = ['A', 'B', 'C', 'D'];
    const avaliacao = service['calculateAvaliacao'](gabarito, respostas);
    expect(avaliacao).toEqual({
      respostasCertas: 3,
      respostasErradas: 0,
      respostasEmBranco: 0,
      percentualDeAcerto: 100,
      percentualDeErro: 0,
      percentualDeRespostasEmBranco: 0,
    });
  });

  it('should ignore extra answers with blank answers', () => {
    const gabarito = { respostas: ['A', 'B', 'C'] };
    const respostas = ['A', 'B', 'C', ''];
    const avaliacao = service['calculateAvaliacao'](gabarito, respostas);
    expect(avaliacao).toEqual({
      respostasCertas: 3,
      respostasErradas: 0,
      respostasEmBranco: 0,
      percentualDeAcerto: 100,
      percentualDeErro: 0,
      percentualDeRespostasEmBranco: 0,
    });
  });

  it('should ignore extra answers with blank answers and wrong answers', () => {
    const gabarito = { respostas: ['A', 'B', 'C'] };
    const respostas = ['A', 'B', 'D', ''];
    const avaliacao = service['calculateAvaliacao'](gabarito, respostas);
    expect(avaliacao).toEqual({
      respostasCertas: 2,
      respostasErradas: 1,
      respostasEmBranco: 0,
      percentualDeAcerto: 66.67,
      percentualDeErro: 33.33,
      percentualDeRespostasEmBranco: 0,
    });
  });

  it('should bypass empty answers from gabarito', () => {
    const gabarito = { respostas: ['A', '', 'C'] };
    const respostas = ['A', 'B', 'C'];
    const avaliacao = service['calculateAvaliacao'](gabarito, respostas);
    expect(avaliacao).toEqual({
      respostasCertas: 2,
      respostasErradas: 0,
      respostasEmBranco: 0,
      percentualDeAcerto: 100,
      percentualDeErro: 0,
      percentualDeRespostasEmBranco: 0,
    });
  });

  it('should calculate percentual', () => {
    expect(service['toPercentual'](0.123456)).toBe(12.35);
  });

  it('should calculate media', () => {
    expect(service['toMedia'](0.123456)).toBe(0.12);
  });

  it('should create or update avaliacao', async () => {
    const gabarito = { respostas: ['A', 'B', 'C'] };
    jest
      .spyOn(service['repositorio'], 'getGabarito')
      .mockResolvedValue(gabarito);
    const respostas = ['A', 'B', 'C'];
    const avaliacao = await service.createOrUpdate({
      idAluno: 1,
      idTurma: 1,
      respostas,
    });
    expect(avaliacao).toEqual({
      respostasCertas: 3,
      respostasErradas: 0,
      respostasEmBranco: 0,
      percentualDeAcerto: 100,
      percentualDeErro: 0,
      percentualDeRespostasEmBranco: 0,
    });
  });

  it('should find by criteria', async () => {
    const avaliacoes = [{ idAluno: 1, idTurma: 1, respostas: ['A', 'B', 'C'] }];
    jest
      .spyOn(service['repositorio'], 'getAvaliacoes')
      .mockResolvedValue(avaliacoes);
    const result = await service.findByCriteria({ idTurma: '1' });
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining(avaliacoes[0])]),
    );
  });

  it('should find by criteria with empty query', async () => {
    const avaliacoes = [{ idAluno: 1, idTurma: 1, respostas: ['A', 'B', 'C'] }];
    jest
      .spyOn(service['repositorio'], 'getAvaliacoes')
      .mockResolvedValue(avaliacoes);
    const result = await service.findByCriteria({});
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining(avaliacoes[0])]),
    );
  });

  it('should find by aluno id', async () => {
    const avaliacoes = [{ idAluno: 1, idTurma: 1, respostas: ['A', 'B', 'C'] }];
    jest
      .spyOn(service['repositorio'], 'getAvaliacoes')
      .mockResolvedValue(avaliacoes);
    const result = await service.findByAlunoId(1);
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining(avaliacoes[0])]),
    );
  });

  it('should consolidate', async () => {
    const avaliacoes = [
      { idAluno: 1, idTurma: 1, respostas: ['A', 'B', 'C'] },
      { idAluno: 2, idTurma: 1, respostas: ['A', 'B', 'C'] },
    ];
    jest
      .spyOn(service['repositorio'], 'getAvaliacoes')
      .mockResolvedValue(avaliacoes);
    jest
      .spyOn(service['repositorio'], 'getGabarito')
      .mockResolvedValue({ respostas: ['A', 'B', 'C'] });
    const result = await service.consolidate(1);
    expect(result).toEqual({
      percentualDeAcerto: 100,
      percentualDeErro: 0,
      percentualDeRespostasEmBranco: 0,
    });
  });

  it('should consolidate with empty avaliacoes', async () => {
    jest.spyOn(service['repositorio'], 'getAvaliacoes').mockResolvedValue([]);
    const result = await service.consolidate(1);
    expect(result).toBeNull();
  });

  it('should delete all', async () => {
    await service.deleteAll();
    expect(service).toBeDefined();
  });
});
