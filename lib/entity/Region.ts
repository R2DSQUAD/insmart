import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// 1. 상단에서 import 합니다.
import { LocalGovernment } from './LocalGovernment'; 

@Entity('region')
export class Region {
  @PrimaryGeneratedColumn({ name: 'region_id', type: 'int', comment: '행정구역 PK' })
  region_id: number;

  @Column({ type: 'varchar', comment: '행정구역 이름' })
  region_name: string;

  // 2. 화살표 함수 () => LocalGovernment 형태로 작성하면 순환 참조(Circular Dependency)가 해결됩니다.
  @OneToMany(() => LocalGovernment, (localGovernment) => localGovernment.region)
  // 3. 타입도 any[] 대신 정확한 클래스 배열로 지정하세요.
  localGovernments: LocalGovernment[]; 
}