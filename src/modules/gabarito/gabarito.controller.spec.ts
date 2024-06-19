import { Test, TestingModule } from '@nestjs/testing';
import { GabaritoController } from './gabarito.controller';
import { GabaritoService } from './gabarito.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

describe('GabaritoController', () => {
  let controller: GabaritoController;

  const GabaritoServiceMock = {
    createOrUpdate: jest.fn(),
    findAll: jest.fn(),
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
      controllers: [GabaritoController],
      providers: [
        { provide: GabaritoService, useValue: GabaritoServiceMock },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    }).compile();

    controller = module.get<GabaritoController>(GabaritoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create or update gabarito', async () => {
    const createGabaritoDto = { respostas: ['A', 'B', 'C'] };
    const result = { respostas: ['A', 'B', 'C'] };
    GabaritoServiceMock.createOrUpdate.mockResolvedValue(result);

    expect(await controller.createOrUpdate(createGabaritoDto)).toBe(result);
    expect(GabaritoServiceMock.createOrUpdate).toHaveBeenCalledWith(
      createGabaritoDto,
    );
  });

  it('should find all gabarito', async () => {
    const result = { respostas: ['A', 'B', 'C'] };
    GabaritoServiceMock.findAll.mockResolvedValue(result);

    expect(await controller.findAll()).toBe(result);
    expect(GabaritoServiceMock.findAll).toHaveBeenCalled();
  });

  it('should delete all gabarito', async () => {
    GabaritoServiceMock.deleteAll.mockResolvedValue(true);
    await controller.deleteAll();

    expect(GabaritoServiceMock.deleteAll).toHaveBeenCalled();
  });
});
