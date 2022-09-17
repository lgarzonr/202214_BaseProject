import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { CiudadEntity } from './ciudad.entity';

const VALID_COUNTRIES = ['Argentina', 'Ecuador', 'Paraguay'];

@Injectable()
export class CiudadService {
  constructor(
    @InjectRepository(CiudadEntity)
    private readonly ciudadRepository: Repository<CiudadEntity>,
  ) {}

  async findAll(): Promise<CiudadEntity[]> {
    return await this.ciudadRepository.find({ relations: ['supermercados'] });
  }

  async findOne(id: string): Promise<CiudadEntity> {
    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id },
    });
    if (!ciudad)
      throw new BusinessLogicException(
        'La ciudad con el id dado no fue encontrada',
        BusinessError.NOT_FOUND,
      );

    return ciudad;
  }

  validateCountry = (pais: string) => {
    if (!VALID_COUNTRIES.includes(pais)) {
      throw new BusinessLogicException(
        'El país indicado no es valido',
        BusinessError.PRECONDITION_FAILED,
      );
    }
  };

  async create(ciudad: CiudadEntity): Promise<CiudadEntity> {
    this.validateCountry(ciudad.pais);
    return await this.ciudadRepository.save(ciudad);
  }

  async update(id: string, ciudad: CiudadEntity): Promise<CiudadEntity> {
    this.validateCountry(ciudad.pais);
    const persistedCiudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id },
    });
    if (!persistedCiudad)
      throw new BusinessLogicException(
        'La ciudad con el id dado no fue encontrada',
        BusinessError.NOT_FOUND,
      );

    return await this.ciudadRepository.save({ ...persistedCiudad, ...ciudad });
  }

  async delete(id: string) {
    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id },
    });
    if (!ciudad)
      throw new BusinessLogicException(
        'La ciudad con el id dado no fue encontrada',
        BusinessError.NOT_FOUND,
      );

    await this.ciudadRepository.remove(ciudad);
  }
}
