import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('insurance')
export class Insurance {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '보험 PK' })
  insurance_id: number;

  @Column({ type: 'date', comment: '보험시작일' })
  insurance_start_date: Date;

  @Column({ type: 'date', comment: '보험종료일' })
  insurance_end_date: Date;

  @Column({ type: 'date', nullable: true, comment: '보험해지신청일' })
  cancellation_request_date: Date;

  @Column({ type: 'date', nullable: true, comment: '보험해지일(출국일)' })
  cancellation_date: Date;

  @Column({ type: 'bigint', comment: '노동자 FK' })
  worker_id: number;

  @ManyToOne('SeasonWorker', 'insurances')
  @JoinColumn({ name: 'worker_id' })
  worker: any;
}
