import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bank_account')
export class BankAccount {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '계좌정보 PK' })
  id: number;

  @Column({ type: 'bigint', comment: '결제방식 FK' })
  payment_id: number;

  @Column({ type: 'varchar', nullable: true, comment: '예금주 소유자 이름' })
  name: string;

  @Column({ type: 'varchar', nullable: true, comment: '계좌 번호' })
  account_no: string;


  @Column({ type: 'varchar', length: 50, comment: '은행명' })
  bank_name: string;

  @ManyToOne('Payment', 'bankAccounts')
  @JoinColumn({ name: 'payment_id' })
  payment: any;
}
