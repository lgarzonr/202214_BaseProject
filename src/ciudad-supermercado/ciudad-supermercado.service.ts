import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';

@Injectable()
export class CiudadSupermercadoService {
  constructor(
    @InjectRepository(SupermercadoEntity)
    private readonly supermercadoRepository: Repository<SupermercadoEntity>,

    @InjectRepository(CiudadEntity)
    private readonly ciudadRepository: Repository<CiudadEntity>,
  ) {}

  async addSupermarketToCity(
    cityId: string,
    supermarketId: string,
  ): Promise<CiudadEntity> {
    const supermercado = await this.getSupermarketBySupermarketId(
      supermarketId,
    );
    const ciudad = await this.getCityByCityId(cityId);

    ciudad.supermercados = [...ciudad.supermercados, supermercado];

    return await this.ciudadRepository.save(ciudad);
  }

  async getSupermarketBySupermarketId(supermarketId: string) {
    const supermercado: SupermercadoEntity =
      await this.supermercadoRepository.findOne({
        where: { id: supermarketId },
      });
    if (!supermercado)
      throw new BusinessLogicException(
        'El supermercado con el id dado no fue encontrado',
        BusinessError.NOT_FOUND,
      );
    return supermercado;
  }

  async getCityByCityId(cityId: string) {
    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id: cityId },
      relations: ['supermercados'],
    });
    if (!ciudad)
      throw new BusinessLogicException(
        'La ciudad con el id dado no fue encontrada',
        BusinessError.NOT_FOUND,
      );
    return ciudad;
  }

  async findSupermarketsFromCity(
    cityId: string,
  ): Promise<SupermercadoEntity[]> {
    const ciudad = await this.getCityByCityId(cityId);
    return ciudad.supermercados;
  }

  async findSupermarketFromCity(
    cityId: string,
    supermarketId: string,
  ): Promise<SupermercadoEntity> {
    const supermercado = await this.getSupermarketBySupermarketId(
      supermarketId,
    );
    const ciudad = await this.getCityByCityId(cityId);

    const ciudadSupermercado: SupermercadoEntity = ciudad.supermercados.find(
      (e) => e.id === supermercado.id,
    );

    if (!ciudadSupermercado)
      throw new BusinessLogicException(
        'El supermercado con el id dado no esta asociado a la ciudad',
        BusinessError.PRECONDITION_FAILED,
      );

    return ciudadSupermercado;
  }

  async updateSupermarketsFromCity(
    cityId: string,
    supermarkets: SupermercadoEntity[],
  ): Promise<CiudadEntity> {
    const ciudad = await this.getCityByCityId(cityId);

    for (let i = 0; i < supermarkets.length; i++) {
      await this.getSupermarketBySupermarketId(supermarkets[i].id);
    }

    ciudad.supermercados = supermarkets;
    return await this.ciudadRepository.save(ciudad);
  }

  async deleteSupermarketFromCity(cityId: string, supermarketId: string) {
    const supermercado = await this.getSupermarketBySupermarketId(
      supermarketId,
    );

    const ciudad = await this.getCityByCityId(cityId);

    const ciudadSupermercado: SupermercadoEntity = ciudad.supermercados.find(
      (e) => e.id === supermercado.id,
    );

    if (!ciudadSupermercado)
      throw new BusinessLogicException(
        'El supermercado con el id dado no esta asociado a la ciudad',
        BusinessError.PRECONDITION_FAILED,
      );

    ciudad.supermercados = ciudad.supermercados.filter(
      (e) => e.id !== supermarketId,
    );
    await this.ciudadRepository.save(ciudad);
  }
}
