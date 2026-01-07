import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('credit_card')
export class CreditCard {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '카드정보 PK' })
  id: number;

  @Column({ type: 'bigint', comment: '결제방식 FK' })
  payment_id: number;

  @Column({ type: 'varchar', nullable: true, comment: '카드 소유자 이름' })
  name: string;

  @Column({ type: 'varchar', nullable: true, comment: '카드 번호' })
  card_no: string;

  @ManyToOne('Payment', 'creditCards')
  @JoinColumn({ name: 'payment_id' })
  payment: any;
}
