import { Test, TestingModule } from '@nestjs/testing';
import { RepositorioService } from './repositorio.service';
import { ConfigModule } from '@nestjs/config';

describe('RepositorioService', () => {
  let service: RepositorioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
        }),
      ],
      providers: [RepositorioService],
    }).compile();

    service = module.get<RepositorioService>(RepositorioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should retrieve gabarito', async () => {
    const gabarito = await service.getGabarito();
    expect(gabarito).toBeDefined();
    expect(gabarito.respostas).toBeDefined();
  });

  it('should update gabarito', async () => {
    const gabarito = await service.getGabarito();
    const respostas = gabarito.respostas;
    respostas[0] = 'A';
    await service.updateGabarito({ respostas });
    const updatedGabarito = await service.getGabarito();
    expect(updatedGabarito.respostas).toEqual(respostas);
  });

  it('should insert avaliacao', async () => {
    const avaliacao = {
      idAluno: 1,
      idTurma: 1,
      respostas: ['A', 'B', 'C'],
    };
    await service.insertAvaliacao(avaliacao);
    const avaliacoes = await service.getAvaliacoes();
    expect(avaliacoes).toContainEqual(avaliacao);
  });

  it('should get avaliacoes by idTurma', async () => {
    const avaliacao = {
      idAluno: 1,
      idTurma: 1,
      respostas: ['A', 'B', 'C'],
    };
    await service.insertAvaliacao(avaliacao);
    const avaliacoes = await service.getAvaliacoes({ idTurma: 1 });
    expect(avaliacoes).toContainEqual(avaliacao);
  });

  it('should get avaliacoes by idAluno', async () => {
    const avaliacao = {
      idAluno: 1,
      idTurma: 1,
      respostas: ['A', 'B', 'C'],
    };
    await service.insertAvaliacao(avaliacao);
    const avaliacoes = await service.getAvaliacoes({ idAluno: 1 });
    expect(avaliacoes).toContainEqual(avaliacao);
  });

  it('should delete all avaliacoes', async () => {
    const avaliacao = {
      idAluno: 1,
      idTurma: 1,
      respostas: ['A', 'B', 'C'],
    };
    await service.insertAvaliacao(avaliacao);
    await service.deleteAll();
    const avaliacoes = await service.getAvaliacoes();
    expect(avaliacoes).toHaveLength(0);
  });
});
