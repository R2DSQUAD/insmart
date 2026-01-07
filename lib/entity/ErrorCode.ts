import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('error_code')
export class ErrorCode {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '에러코드 PK' })
  error_id: number;

  @Column({ type: 'varchar', nullable: true, comment: '에러 설명' })
  error_context: string;

  @Column({ type: 'bigint', comment: '결제방식 FK' })
  payment_id: number;

  @ManyToOne('Payment', 'errorCodes')
  @JoinColumn({ name: 'payment_id' })
  payment: any;
}
