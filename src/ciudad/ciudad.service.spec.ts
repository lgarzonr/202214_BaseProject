import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { CiudadEntity } from './ciudad.entity';
import { CiudadService } from './ciudad.service';
import { faker } from '@faker-js/faker';

describe('CiudadService', () => {
  let service: CiudadService;
  let repository: Repository<CiudadEntity>;
  let ciudadList: Array<CiudadEntity>;

  const seedDatabase = async () => {
    repository.clear();
    ciudadList = [];
    for (let i = 0; i < 5; i++) {
      const ciudad: CiudadEntity = await repository.save({
        nombre: faker.company.name(),
        pais: faker.address.county(),
        habitantes: faker.datatype.number(100000000),
      });
      ciudadList.push(ciudad);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadService],
    }).compile();

    service = module.get<CiudadService>(CiudadService);
    repository = module.get<Repository<CiudadEntity>>(
      getRepositoryToken(CiudadEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all ciudads', async () => {
    const ciudads: CiudadEntity[] = await service.findAll();
    expect(ciudads).not.toBeNull();
    expect(ciudads).toHaveLength(ciudadList.length);
  });

  it('findOne should return a ciudad by id', async () => {
    const storedCiudad: CiudadEntity = ciudadList[0];
    const ciudad: CiudadEntity = await service.findOne(storedCiudad.id);
    expect(ciudad).not.toBeNull();
    expect(ciudad.nombre).toEqual(storedCiudad.nombre);
    expect(ciudad.pais).toEqual(storedCiudad.pais);
  });

  it('findOne should throw an exception for an invalid ciudad', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'La ciudad con el id dado no fue encontrada',
    );
  });

  it('create should return a new ciudad if valid pais', async () => {
    const ciudad: CiudadEntity = {
      id: '',
      nombre: faker.company.name(),
      pais: 'Argentina',
      habitantes: 0,
      supermercados: [],
    };

    const newCiudad: CiudadEntity = await service.create(ciudad);
    expect(newCiudad).not.toBeNull();

    const storedCiudad: CiudadEntity = await repository.findOne({
      where: { id: `${newCiudad.id}` },
    });
    expect(storedCiudad).not.toBeNull();
    expect(storedCiudad.id).not.toBeNull();
    expect(storedCiudad.nombre).toEqual(newCiudad.nombre);
    expect(storedCiudad.pais).toEqual(newCiudad.pais);
  });

  it('create should throw an exception for an invalid pais', async () => {
    const ciudad: CiudadEntity = {
      id: '',
      nombre: faker.company.name(),
      pais: 'Colombia',
      habitantes: 0,
      supermercados: [],
    };

    await expect(() => service.create(ciudad)).rejects.toHaveProperty(
      'message',
      'El país indicado no es valido',
    );
  });

  it('update should modify a ciudad if valid pais', async () => {
    const ciudad: CiudadEntity = ciudadList[0];
    ciudad.nombre = 'New name';
    ciudad.pais = 'Argentina';
    const updatedCiudad: CiudadEntity = await service.update(ciudad.id, ciudad);
    expect(updatedCiudad).not.toBeNull();
    const storedCiudad: CiudadEntity = await repository.findOne({
      where: { id: `${ciudad.id}` },
    });
    expect(storedCiudad).not.toBeNull();
    expect(storedCiudad.nombre).toEqual(ciudad.nombre);
    expect(storedCiudad.pais).toEqual(ciudad.pais);
  });

  it('update should throw an exception for an invalid pais', async () => {
    const ciudad: CiudadEntity = ciudadList[0];
    ciudad.nombre = 'New name';
    ciudad.pais = 'Colombia';

    await expect(() =>
      service.update(ciudad.id, ciudad),
    ).rejects.toHaveProperty('message', 'El país indicado no es valido');
  });

  it('update should throw an exception for an invalid ciudad', async () => {
    let ciudad: CiudadEntity = ciudadList[0];
    ciudad = {
      ...ciudad,
      nombre: 'New name',
      pais: 'Argentina',
    };
    await expect(() => service.update('0', ciudad)).rejects.toHaveProperty(
      'message',
      'La ciudad con el id dado no fue encontrada',
    );
  });

  it('delete should remove a ciudad', async () => {
    const ciudad: CiudadEntity = ciudadList[0];
    await service.delete(ciudad.id);
    const deletedCiudad: CiudadEntity = await repository.findOne({
      where: { id: `${ciudad.id}` },
    });
    expect(deletedCiudad).toBeNull();
  });

  it('delete should throw an exception for an invalid ciudad', async () => {
    const ciudad: CiudadEntity = ciudadList[0];
    await service.delete(ciudad.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'La ciudad con el id dado no fue encontrada',
    );
  });
});
