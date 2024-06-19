import { Test, TestingModule } from '@nestjs/testing';
import { AvaliacaoController } from './avaliacao.controller';
import { AvaliacaoService } from './avaliacao.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

describe('AvaliacaoController', () => {
  let controller: AvaliacaoController;

  const AvaliacaoServiceMock = {
    createOrUpdate: jest.fn(),
    findByCriteria: jest.fn(),
    consolidate: jest.fn(),
    deleteAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 10000,
            limit: 100,
          },
        ]),
      ],
      controllers: [AvaliacaoController],
      providers: [
        { provide: AvaliacaoService, useValue: AvaliacaoServiceMock },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    }).compile();

    controller = module.get<AvaliacaoController>(AvaliacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an avaliacao', async () => {
    const createAvaliacaoDto = {
      idAluno: 1,
      idTurma: 1,
      respostas: ['A', 'B', 'C'],
    };
    const result = {
      percentualDeAcerto: 100,
      percentualDeErro: 0,
      percentualDeRespostasEmBranco: 0,
    };
    AvaliacaoServiceMock.createOrUpdate.mockResolvedValue(result);

    expect(await controller.create(createAvaliacaoDto)).toBe(result);
    expect(AvaliacaoServiceMock.createOrUpdate).toHaveBeenCalledWith(
      createAvaliacaoDto,
    );
  });

  it('should find avaliacoes by criteria', async () => {
    const query = { idTurma: '1', idAluno: '1' };
    const result = [
      {
        idAluno: 1,
        idTurma: 1,
        respostas: ['A', 'B', 'C'],
        percentualDeAcerto: 100,
        percentualDeErro: 0,
        percentualDeRespostasEmBranco: 0,
      },
    ];
    AvaliacaoServiceMock.findByCriteria.mockResolvedValue(result);

    expect(await controller.findByCriteria(query)).toBe(result);
    expect(AvaliacaoServiceMock.findByCriteria).toHaveBeenCalledWith(query);
  });

  it('should consolidate avaliacoes', async () => {
    const idTurma = 1;
    const result = {
      percentualDeAcerto: 100,
      percentualDeErro: 0,
      percentualDeRespostasEmBranco: 0,
    };
    AvaliacaoServiceMock.consolidate.mockResolvedValue(result);

    expect(await controller.consolidate(idTurma)).toBe(result);
    expect(AvaliacaoServiceMock.consolidate).toHaveBeenCalledWith(idTurma);
  });

  it('should delete all avaliacoes', async () => {
    await controller.deleteAll();
    expect(AvaliacaoServiceMock.deleteAll).toHaveBeenCalled();
  });

  it('should throw not found exception when no avaliacoes are found', async () => {
    AvaliacaoServiceMock.findByCriteria.mockResolvedValue([]);
    await expect(controller.findByCriteria({})).rejects.toThrowError(
      'Nenhuma avaliação encontrada.',
    );
  });

  it('should throw not found exception when no avaliacoes are found for the turma', async () => {
    AvaliacaoServiceMock.consolidate.mockResolvedValue(null);
    await expect(controller.consolidate(1)).rejects.toThrowError(
      'Nenhuma avaliação encontrada para a turma.',
    );
  });
});
