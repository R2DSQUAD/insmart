import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('region')
export class Region {
  @PrimaryGeneratedColumn({ name: 'region_id', type: 'int', comment: '행정구역 PK' })
  region_id: number;

  @Column({ type: 'varchar', comment: '행정구역 이름' })
  region_name: string;

  @OneToMany('LocalGovernment', 'region')
  localGovernments: any[];
}
