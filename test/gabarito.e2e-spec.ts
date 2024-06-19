import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { GabaritoController } from '../src/modules/gabarito/gabarito.controller';
import { GabaritoModule } from '../src/modules/gabarito/gabarito.module';
import { GabaritoService } from '../src/modules/gabarito/gabarito.service';
import { RepositorioService } from '../src/modules/repositorio/repositorio.service';

jest.useRealTimers();

describe('Gabarito (e2e)', () => {
  let app: INestApplication;

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
        GabaritoModule,
      ],
      controllers: [GabaritoController],
      providers: [GabaritoService, RepositorioService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    app.close();
  });

  it('/gabarito (POST)', () => {
    return request(app.getHttpServer())
      .post('/gabarito')
      .send({ respostas: ['A', 'B', 'C'] })
      .expect(201);
  });

  it('/gabarito (GET)', () => {
    return request(app.getHttpServer()).get('/gabarito').expect(200);
  });

  it('/gabarito (DELETE)', () => {
    return request(app.getHttpServer()).delete('/gabarito').expect(200);
  });
});
