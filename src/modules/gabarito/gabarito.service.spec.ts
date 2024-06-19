import { Test, TestingModule } from '@nestjs/testing';
import { GabaritoService } from './gabarito.service';
import { ConfigModule } from '@nestjs/config';
import { RepositorioService } from '../repositorio/repositorio.service';

describe('GabaritoService', () => {
  let service: GabaritoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
        }),
      ],
      providers: [GabaritoService, RepositorioService],
    }).compile();

    service = module.get<GabaritoService>(GabaritoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create or update gabarito', async () => {
    const createGabaritoDto = { respostas: ['A', 'B', 'C'] };
    await service.createOrUpdate(createGabaritoDto);
    const gabarito = await service.findAll();
    expect(gabarito).toEqual(createGabaritoDto);
  });

  it('should delete all gabarito', async () => {
    await service.deleteAll();
    const gabarito = await service.findAll();
    expect(gabarito).toEqual({ respostas: [] });
  });

  it('should get all gabarito', async () => {
    const gabarito = await service.findAll();
    expect(gabarito).toEqual({ respostas: [] });
  });

  it('should update gabarito', async () => {
    const createGabaritoDto = { respostas: ['A', 'B', 'C'] };
    await service.createOrUpdate(createGabaritoDto);
    const gabarito = await service.findAll();
    expect(gabarito).toEqual(createGabaritoDto);

    const newGabarito = { respostas: ['A', 'B', 'D'] };
    await service.createOrUpdate(newGabarito);
    const updatedGabarito = await service.findAll();
    expect(updatedGabarito).toEqual(newGabarito);
  });
});
