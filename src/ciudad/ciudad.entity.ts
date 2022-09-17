import { SupermercadoEntity } from 'src/supermercado/supermercado.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CiudadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  pais: string;

  @Column()
  habitantes: number;

  @OneToMany(() => SupermercadoEntity, (supermercado) => supermercado.ciudad)
  supermercados: SupermercadoEntity[];
}
