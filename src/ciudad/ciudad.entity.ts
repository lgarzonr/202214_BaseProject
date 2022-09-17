import { SupermercadoEntity } from '../supermercado/supermercado.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CiudadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  pais: string;

  @Column({ type: 'bigint' })
  habitantes: number;

  @OneToMany(() => SupermercadoEntity, (supermercado) => supermercado.ciudad)
  supermercados: SupermercadoEntity[];
}
