import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { SupermercadoEntity } from './supermercado.entity';
import { SupermercadoService } from './supermercado.service';
import { faker } from '@faker-js/faker';
import { CiudadEntity } from '../ciudad/ciudad.entity';

describe('SupermercadoService', () => {
  let service: SupermercadoService;
  let repository: Repository<SupermercadoEntity>;
  let supermercadoList: Array<SupermercadoEntity>;
  let ciudad: CiudadEntity;
  let repositoryCiudad: Repository<CiudadEntity>;

  const seedDatabase = async () => {
    repository.clear();
    supermercadoList = [];
    for (let i = 0; i < 5; i++) {
      const supermercado: SupermercadoEntity = await repository.save({
        nombre: faker.company.name(),
        longitud: faker.datatype.float(),
        latitud: faker.datatype.float(),
        web: faker.internet.url(),
      });
      supermercadoList.push(supermercado);
    }
    ciudad = await repositoryCiudad.save({
      nombre: faker.company.name(),
      pais: 'Ecuador',
      habitantes: faker.datatype.number(100000000),
      supermercados: [],
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SupermercadoService],
    }).compile();

    service = module.get<SupermercadoService>(SupermercadoService);
    repository = module.get<Repository<SupermercadoEntity>>(
      getRepositoryToken(SupermercadoEntity),
    );
    repositoryCiudad = module.get<Repository<CiudadEntity>>(
      getRepositoryToken(CiudadEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all supermercados', async () => {
    const supermercados: SupermercadoEntity[] = await service.findAll();
    expect(supermercados).not.toBeNull();
    expect(supermercados).toHaveLength(supermercadoList.length);
  });

  it('findOne should return a supermercado by id', async () => {
    const storedSupermercado: SupermercadoEntity = supermercadoList[0];
    const supermercado: SupermercadoEntity = await service.findOne(
      storedSupermercado.id,
    );
    expect(supermercado).not.toBeNull();
    expect(supermercado.nombre).toEqual(storedSupermercado.nombre);
    expect(supermercado.web).toEqual(storedSupermercado.web);
  });

  it('findOne should throw an exception for an invalid supermercado', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'El supermercado con el id dado no fue encontrado',
    );
  });

  it('create should return a new supermercado if valid name', async () => {
    const supermercado: SupermercadoEntity = {
      id: '',
      nombre: 'more than 10 chara.',
      longitud: 0,
      latitud: 0,
      web: '',
      ciudad,
    };

    const newSupermercado: SupermercadoEntity = await service.create(
      supermercado,
    );
    expect(newSupermercado).not.toBeNull();

    const storedSupermercado: SupermercadoEntity = await repository.findOne({
      where: { id: `${newSupermercado.id}` },
    });
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.id).not.toBeNull();
    expect(storedSupermercado.nombre).toEqual(newSupermercado.nombre);
    expect(storedSupermercado.web).toEqual(newSupermercado.web);
  });

  it('create should throw an exception for an invalid name', async () => {
    const supermercado: SupermercadoEntity = {
      id: '',
      nombre: 'lessthan10',
      longitud: 0,
      latitud: 0,
      web: '',
      ciudad,
    };

    await expect(() => service.create(supermercado)).rejects.toHaveProperty(
      'message',
      'El nombre debe tener más de 10 caracteres',
    );
  });

  it('update should modify a supermercado if valid name', async () => {
    const supermercado: SupermercadoEntity = supermercadoList[0];
    supermercado.nombre = 'New name more than 10';
    supermercado.web = 'new url';
    const updatedSupermercado: SupermercadoEntity = await service.update(
      supermercado.id,
      supermercado,
    );
    expect(updatedSupermercado).not.toBeNull();
    const storedSupermercado: SupermercadoEntity = await repository.findOne({
      where: { id: `${supermercado.id}` },
    });
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.nombre).toEqual(supermercado.nombre);
    expect(storedSupermercado.web).toEqual(supermercado.web);
  });

  it('update should throw an exception for an invalid name', async () => {
    const supermercado: SupermercadoEntity = supermercadoList[0];
    supermercado.nombre = '12345';
    supermercado.web = 'new url';
    await expect(() =>
      service.update(supermercado.id, supermercado),
    ).rejects.toHaveProperty(
      'message',
      'El nombre debe tener más de 10 caracteres',
    );
  });

  it('update should throw an exception for an invalid supermercado', async () => {
    let supermercado: SupermercadoEntity = supermercadoList[0];
    supermercado = {
      ...supermercado,
      nombre: 'New name more than 10',
      web: 'new url',
    };
    await expect(() =>
      service.update('0', supermercado),
    ).rejects.toHaveProperty(
      'message',
      'El supermercado con el id dado no fue encontrado',
    );
  });

  it('delete should remove a supermercado', async () => {
    const supermercado: SupermercadoEntity = supermercadoList[0];
    await service.delete(supermercado.id);
    const deletedSupermercado: SupermercadoEntity = await repository.findOne({
      where: { id: `${supermercado.id}` },
    });
    expect(deletedSupermercado).toBeNull();
  });

  it('delete should throw an exception for an invalid supermercado', async () => {
    const supermercado: SupermercadoEntity = supermercadoList[0];
    await service.delete(supermercado.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'El supermercado con el id dado no fue encontrado',
    );
  });
});
