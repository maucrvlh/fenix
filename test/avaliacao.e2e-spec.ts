import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { RepositorioService } from '../src/modules/repositorio/repositorio.service';
import { AvaliacaoModule } from '../src/modules/avaliacao/avaliacao.module';
import { AvaliacaoController } from '../src/modules/avaliacao/avaliacao.controller';
import { AvaliacaoService } from '../src/modules/avaliacao/avaliacao.service';

jest.useRealTimers();

describe('Avaliacao (e2e)', () => {
  let app: INestApplication;

  const RepositorioServiceMock = {
    getGabarito: jest.fn(),
    getAvaliacoes: jest.fn(),
    deleteAll: jest.fn(),
    insertAvaliacao: jest.fn(),
    updateGabarito: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 10000,
            limit: 100,
          },
        ]),
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
        }),
        AvaliacaoModule,
      ],
      controllers: [AvaliacaoController],
      providers: [
        AvaliacaoService,
        { provide: RepositorioService, useValue: RepositorioServiceMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    app.close();
  });

  it('/avaliacao (POST)', () => {
    RepositorioServiceMock.getGabarito.mockReturnValueOnce({
      respostas: ['A', 'B', 'C'],
    });
    return request(app.getHttpServer())
      .post('/avaliacao')
      .send({ idTurma: 1, idAluno: 1, respostas: ['A', 'B', 'C'] })
      .expect(201);
  });

  it('/avaliacao (GET)', () => {
    RepositorioServiceMock.getGabarito.mockReturnValueOnce({
      respostas: ['A', 'B', 'C'],
    });
    RepositorioServiceMock.getAvaliacoes.mockReturnValueOnce([
      { idTurma: 1, idAluno: 1, respostas: ['A', 'B', 'C'] },
    ]);
    return request(app.getHttpServer())
      .get('/avaliacao')
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveLength(1);
        expect(response.body[0].idTurma).toBe(1);
        expect(response.body[0].idAluno).toBe(1);
        expect(response.body[0].avaliacao.percentualDeAcerto).toBe(100);
        expect(response.body[0].avaliacao.percentualDeErro).toBe(0);
        expect(response.body[0].avaliacao.percentualDeRespostasEmBranco).toBe(
          0,
        );
      });
  });

  it('/avaliacao (DELETE)', () => {
    return request(app.getHttpServer()).delete('/avaliacao').expect(200);
  });

  it('/avaliacao/consolidado/:idTurma (GET)', () => {
    RepositorioServiceMock.getGabarito.mockReturnValueOnce({
      respostas: ['A', 'B', 'C'],
    });
    RepositorioServiceMock.getAvaliacoes.mockReturnValueOnce([
      { idTurma: 1, idAluno: 1, respostas: ['A', 'B', 'C'] },
      { idTurma: 1, idAluno: 2, respostas: ['A', 'B', 'C'] },
      { idTurma: 1, idAluno: 3, respostas: ['A', 'B', 'D'] },
    ]);

    return request(app.getHttpServer())
      .get('/avaliacao/consolidado/1')
      .expect(200)
      .then((response) => {
        expect(response.body.percentualDeAcerto).toBe(88.89);
        expect(response.body.percentualDeErro).toBe(11.11);
        expect(response.body.percentualDeRespostasEmBranco).toBe(0);
      });
  });

  it('/avaliacao/consolidado/:idTurma (GET) - sem avaliações', () => {
    RepositorioServiceMock.getAvaliacoes.mockReturnValueOnce([]);
    return request(app.getHttpServer())
      .get('/avaliacao/consolidado/1')
      .expect(404);
  });

  it('/avaliacao/consolidado/:idTurma (GET) - sem gabarito', () => {
    RepositorioServiceMock.getGabarito.mockReturnValueOnce({
      respostas: [],
    });
    RepositorioServiceMock.getAvaliacoes.mockReturnValueOnce([
      { idTurma: 1, idAluno: 1, respostas: ['A', 'B', 'C'] },
      { idTurma: 1, idAluno: 2, respostas: ['A', 'B', 'C'] },
      { idTurma: 1, idAluno: 3, respostas: ['A', 'B', 'D'] },
    ]);
    return request(app.getHttpServer())
      .get('/avaliacao/consolidado/1')
      .expect(200)
      .then((response) => {
        expect(response.body.percentualDeAcerto).toBeNull();
        expect(response.body.percentualDeErro).toBeNull();
        expect(response.body.percentualDeRespostasEmBranco).toBeNull();
      });
  });

  it('/avaliacao/consolidado/:idTurma (GET) - sem gabarito e sem avaliações', () => {
    RepositorioServiceMock.getGabarito.mockReturnValueOnce({
      respostas: [],
    });
    RepositorioServiceMock.getAvaliacoes.mockReturnValueOnce([]);
    return request(app.getHttpServer())
      .get('/avaliacao/consolidado/1')
      .expect(404);
  });
});
