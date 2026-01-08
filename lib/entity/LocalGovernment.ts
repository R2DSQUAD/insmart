import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('local_government')
export class LocalGovernment {
  @PrimaryGeneratedColumn({ name: 'local_government_id', type: 'int', comment: '자치단체 PK' })
  local_government_id: number;

  @Column({ type: 'int', comment: '행정구역 FK' })
  region_id: number;

  @Column({ type: 'bigint', comment: '공공형 관리자 FK' })
  manager_public_id: number;

  @Column({ type: 'bigint', comment: '일반형 관리자 FK' })
  manager_general_id: number;

  @Column({ type: 'varchar', comment: '행정구역 이름' })
  region_name: string;

  @Column({ type: 'varchar', comment: '자치단체 이름' })
  local_government_name: string;

  @ManyToOne(() => require('./Region').Region, region => region.localGovernments)
  @JoinColumn({ name: 'region_id' })
  region: any;

  @ManyToOne('LocalManagerPublic', 'localGovernments')
  @JoinColumn({ name: 'manager_public_id' })
  publicManager: any;

  @ManyToOne('LocalManagerGeneral', 'localGovernments')
  @JoinColumn({ name: 'manager_general_id' })
  generalManager: any;
}
