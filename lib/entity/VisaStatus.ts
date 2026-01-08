
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('visa_status')
export class VisaStatus {
  @PrimaryGeneratedColumn({ type: 'int', comment: '비자유형 PK' })
  visa_status_id: number;

  @Column({ type: 'varchar', length: 20, unique: true, comment: '비자유형 코드' })
  visa_code: string;

  @Column({ type: 'varchar', nullable: true, comment: '비자 상세 내용' })
  visa_description: string;
}
