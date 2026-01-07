import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('country')
export class Country {
  @PrimaryGeneratedColumn({ name: 'country_id', type: 'int', comment: '국가 PK' })
  country_id: number;

  @Column({ type: 'varchar', length: 3, unique: true, comment: 'ISO 3166-1 alpha-3 국가코드' })
  country_code: string;

  @Column({ type: 'varchar', length: 100, comment: '국가명' })
  country_name: string;
}
