import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('visa_status')
export class VisaStatus {
  @PrimaryGeneratedColumn({ type: 'int', comment: '비자유형 PK' })
  visa_status_id: number;

  @Column({ type: 'bigint', comment: '노동자 FK' })
  worker_id: number;

  @Column({ type: 'char', nullable: true, comment: '비자유형 코드' })
  visa_code: string;

  @Column({ type: 'varchar', nullable: true, comment: '비자 상세 내용' })
  visa_description: string;

  @ManyToOne('SeasonWorker', 'visaStatuses')
  @JoinColumn({ name: 'worker_id' })
  worker: any;
}
