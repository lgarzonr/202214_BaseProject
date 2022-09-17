import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';

describe('CiudadSupermercadoService', () => {
  let service: CiudadSupermercadoService;
  let ciudadRepository: Repository<CiudadEntity>;
  let supermercadoRepository: Repository<SupermercadoEntity>;
  let ciudad: CiudadEntity;
  let supermercadosList: SupermercadoEntity[];

  const seedDatabase = async () => {
    supermercadoRepository.clear();
    ciudadRepository.clear();

    supermercadosList = [];
    for (let i = 0; i < 5; i++) {
      const supermercado: SupermercadoEntity = await getNewSupermercado();
      supermercadosList.push(supermercado);
    }

    ciudad = await ciudadRepository.save({
      nombre: faker.company.name(),
      pais: 'Ecuador',
      habitantes: faker.datatype.number(100000000),
      supermercados: supermercadosList,
    });
  };

  const getNewSupermercado = () => {
    return supermercadoRepository.save({
      nombre: faker.company.name(),
      longitud: faker.datatype.float(),
      latitud: faker.datatype.float(),
      web: faker.internet.url(),
    });
  };

  const getNewCiudad = () => {
    return ciudadRepository.save({
      nombre: faker.company.name(),
      pais: 'Ecuador',
      habitantes: faker.datatype.number(100000000),
      supermercados: [],
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadSupermercadoService],
    }).compile();

    service = module.get<CiudadSupermercadoService>(CiudadSupermercadoService);
    supermercadoRepository = module.get<Repository<SupermercadoEntity>>(
      getRepositoryToken(SupermercadoEntity),
    );
    ciudadRepository = module.get<Repository<CiudadEntity>>(
      getRepositoryToken(CiudadEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addSupermarketToCity should add an supermercado to a ciudad', async () => {
    const supermercado = supermercadosList[0];
    const newCiudad: CiudadEntity = await getNewCiudad();

    const result: CiudadEntity = await service.addSupermarketToCity(
      newCiudad.id,
      supermercado.id,
    );

    expect(result.supermercados.length).toBe(1);
    expect(result.supermercados[0]).not.toBeNull();
    expect(result.supermercados[0].nombre).toBe(supermercado.nombre);
    expect(result.supermercados[0].web).toBe(supermercado.web);
    expect(result.supermercados[0].latitud).toBe(supermercado.latitud);
    expect(result.supermercados[0].longitud).toBe(supermercado.longitud);
  });

  it('addSupermarketToCity should thrown exception for an invalid supermercado', async () => {
    await expect(() =>
      service.addSupermarketToCity(ciudad.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'El supermercado con el id dado no fue encontrado',
    );
  });

  it('addSupermercadoCiudad should throw an exception for an invalid ciudad', async () => {
    await expect(() =>
      service.addSupermarketToCity('0', supermercadosList[1].id),
    ).rejects.toHaveProperty(
      'message',
      'La ciudad con el id dado no fue encontrada',
    );
  });

  it('findSupermarketFromCity should return supermercado by ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    const storedSupermercado: SupermercadoEntity =
      await service.findSupermarketFromCity(ciudad.id, supermercado.id);
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.nombre).toBe(supermercado.nombre);
    expect(storedSupermercado.web).toBe(supermercado.web);
    expect(storedSupermercado.latitud).toBe(supermercado.latitud);
    expect(storedSupermercado.longitud).toBe(supermercado.longitud);
  });

  it('findSupermarketFromCity should throw an exception for an invalid supermercado', async () => {
    await expect(() =>
      service.findSupermarketFromCity(ciudad.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'El supermercado con el id dado no fue encontrado',
    );
  });

  it('findSupermarketFromCity should throw an exception for an invalid ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await expect(() =>
      service.findSupermarketFromCity('0', supermercado.id),
    ).rejects.toHaveProperty(
      'message',
      'La ciudad con el id dado no fue encontrada',
    );
  });

  it('findSupermarketFromCity should throw an exception for an supermercado not associated to the ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await getNewSupermercado();
    await expect(() =>
      service.findSupermarketFromCity(ciudad.id, newSupermercado.id),
    ).rejects.toHaveProperty(
      'message',
      'El supermercado con el id dado no esta asociado a la ciudad',
    );
  });

  it('findSupermarketsFromCity should return supermercados by ciudad', async () => {
    const supermercados: SupermercadoEntity[] =
      await service.findSupermarketsFromCity(ciudad.id);
    expect(supermercados.length).toBe(supermercadosList.length);
  });

  it('findSupermarketsFromCity should throw an exception for an invalid ciudad', async () => {
    await expect(() =>
      service.findSupermarketsFromCity('0'),
    ).rejects.toHaveProperty(
      'message',
      'La ciudad con el id dado no fue encontrada',
    );
  });

  it('updateSupermarketsFromCity should update supermercados list for a ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await getNewSupermercado();

    const updatedCiudad: CiudadEntity =
      await service.updateSupermarketsFromCity(ciudad.id, [newSupermercado]);
    expect(updatedCiudad.supermercados.length).toBe(1);

    expect(updatedCiudad.supermercados[0].nombre).toBe(newSupermercado.nombre);
    expect(updatedCiudad.supermercados[0].web).toBe(newSupermercado.web);
    expect(updatedCiudad.supermercados[0].latitud).toBe(
      newSupermercado.latitud,
    );
    expect(updatedCiudad.supermercados[0].longitud).toBe(
      newSupermercado.longitud,
    );
  });

  it('updateSupermarketsFromCity should throw an exception for an invalid ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await getNewSupermercado();

    await expect(() =>
      service.updateSupermarketsFromCity('0', [newSupermercado]),
    ).rejects.toHaveProperty(
      'message',
      'La ciudad con el id dado no fue encontrada',
    );
  });

  it('updateSupermarketsFromCity should throw an exception for an invalid supermercado', async () => {
    const newSupermercado: SupermercadoEntity = supermercadosList[0];
    newSupermercado.id = '0';

    await expect(() =>
      service.updateSupermarketsFromCity(ciudad.id, [newSupermercado]),
    ).rejects.toHaveProperty(
      'message',
      'El supermercado con el id dado no fue encontrado',
    );
  });

  it('deleteSupermarketFromCity should remove an supermercado from a ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];

    await service.deleteSupermarketFromCity(ciudad.id, supermercado.id);

    const storedCiudad: CiudadEntity = await ciudadRepository.findOne({
      where: { id: `${ciudad.id}` },
      relations: ['supermercados'],
    });
    const deletedSupermercado: SupermercadoEntity =
      storedCiudad.supermercados.find((a) => a.id === supermercado.id);

    expect(deletedSupermercado).toBeUndefined();
  });

  it('deleteSupermarketFromCity should thrown an exception for an invalid supermercado', async () => {
    await expect(() =>
      service.deleteSupermarketFromCity(ciudad.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'El supermercado con el id dado no fue encontrado',
    );
  });

  it('deleteSupermarketFromCity should thrown an exception for an invalid ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await expect(() =>
      service.deleteSupermarketFromCity('0', supermercado.id),
    ).rejects.toHaveProperty(
      'message',
      'La ciudad con el id dado no fue encontrada',
    );
  });

  it('deleteSupermarketFromCity should thrown an exception for an non asocciated supermercado', async () => {
    const newSupermercado: SupermercadoEntity = await getNewSupermercado();

    await expect(() =>
      service.deleteSupermarketFromCity(ciudad.id, newSupermercado.id),
    ).rejects.toHaveProperty(
      'message',
      'El supermercado con el id dado no esta asociado a la ciudad',
    );
  });
});
