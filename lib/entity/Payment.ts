import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

export enum PaymentType {
  AUTO_TRANSFER = '자동이체',
  SYSTEM_PAYMENT = '시스템 결제'
}

export enum PaymentMethod {
  CARD = '카드',
  ACCOUNT = '계좌',
  OTHER = '기타'
}

export enum PaymentStatus {
  COMPLETE = '완료',
  PENDING = '대기',
  REFUND = '환불',
  ERROR = '오류'
}

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '결제방식 PK' })
  payment_id: number;

  @Column({
    type: 'enum',
    enum: PaymentType,
    comment: '자동이체/시스템결제'
  })
  payment_type: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    comment: '카드/계좌'
  })
  payment_method: PaymentMethod;

  @Column({ type: 'bigint', comment: '사업자 FK' })
  employer_id: number;

  @Column({ type: 'bigint', nullable: true, comment: '총 결제 금액' })
  payment_amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    nullable: true,
    comment: '결제 상태'
  })
  payment_status: PaymentStatus;

  @Column({ type: 'varbinary', nullable: true, comment: '오류일 경우 에러코드' })
  error_code: Buffer;

  @Column({ type: 'datetime', nullable: true, comment: '결제 시간' })
  payment_date: Date;

  @Column({ type: 'int', nullable: true, comment: '결제 대상 인원수' })
  worker_count: number;

  @Column({ type: 'int', nullable: true, comment: '외국인근로자 거주 개월' })
  residence_months: number;

  @Column({ type: 'bigint', nullable: true, comment: '보험료 최종금액' })
  final_amount: number;

  @ManyToOne('Employer', 'payments')
  @JoinColumn({ name: 'employer_id' })
  employer: any;

  @OneToMany('BankAccount', 'payment')
  bankAccounts: any[];

  @OneToMany('CreditCard', 'payment')
  creditCards: any[];

}
