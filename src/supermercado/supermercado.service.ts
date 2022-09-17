import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { SupermercadoEntity } from './supermercado.entity';

const MIN_NAME_LENGTH = 10;

@Injectable()
export class SupermercadoService {
  constructor(
    @InjectRepository(SupermercadoEntity)
    private readonly supermercadoRepository: Repository<SupermercadoEntity>,
  ) {}

  async findAll(): Promise<SupermercadoEntity[]> {
    return await this.supermercadoRepository.find({ relations: ['ciudad'] });
  }

  async findOne(id: string): Promise<SupermercadoEntity> {
    const supermercado: SupermercadoEntity =
      await this.supermercadoRepository.findOne({
        where: { id },
      });
    if (!supermercado)
      throw new BusinessLogicException(
        'El supermercado con el id dado no fue encontrado',
        BusinessError.NOT_FOUND,
      );

    return supermercado;
  }

  validateNameLength = (name: string) => {
    if (name.length <= MIN_NAME_LENGTH) {
      throw new BusinessLogicException(
        'El nombre debe tener más de 10 caracteres',
        BusinessError.PRECONDITION_FAILED,
      );
    }
  };

  async create(supermercado: SupermercadoEntity): Promise<SupermercadoEntity> {
    this.validateNameLength(supermercado.nombre);
    return await this.supermercadoRepository.save(supermercado);
  }

  async update(
    id: string,
    supermercado: SupermercadoEntity,
  ): Promise<SupermercadoEntity> {
    this.validateNameLength(supermercado.nombre);
    const persistedSupermercado: SupermercadoEntity =
      await this.supermercadoRepository.findOne({
        where: { id },
      });
    if (!persistedSupermercado)
      throw new BusinessLogicException(
        'El supermercado con el id dado no fue encontrado',
        BusinessError.NOT_FOUND,
      );

    return await this.supermercadoRepository.save({
      ...persistedSupermercado,
      ...supermercado,
    });
  }

  async delete(id: string) {
    const supermercado: SupermercadoEntity =
      await this.supermercadoRepository.findOne({
        where: { id },
      });
    if (!supermercado)
      throw new BusinessLogicException(
        'El supermercado con el id dado no fue encontrado',
        BusinessError.NOT_FOUND,
      );

    await this.supermercadoRepository.remove(supermercado);
  }
}
