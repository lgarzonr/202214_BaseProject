import { CiudadEntity } from '../ciudad/ciudad.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SupermercadoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  longitud: number;

  @Column()
  latitud: number;

  @Column()
  web: string;

  @ManyToOne(() => CiudadEntity, (ciudad) => ciudad.supermercados)
  ciudad: CiudadEntity;
}
