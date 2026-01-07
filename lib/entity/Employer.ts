import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AccountStatus } from './LocalManagerPublic';

@Entity('employer')
export class Employer {
  @PrimaryGeneratedColumn({ name: 'employer_id', type: 'bigint', comment: '사업자 PK' })
  employer_id: number;

  @Column({ type: 'varchar', comment: 'PIN코드' })
  password: string;

  @Column({ type: 'varchar', comment: '사업자 이름' })
  owner_name: string;

  @Column({ type: 'varchar', comment: '상호명' })
  business_name: string;

  @Column({ type: 'varchar', nullable: true, comment: '사업자등록번호' })
  business_reg_no: string;

  @Column({ type: 'varchar', nullable: true, comment: '주소' })
  address: string;

  @Column({ type: 'varchar', comment: '전화번호' })
  phone: string;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    comment: '가입 상태'
  })
  account_status: AccountStatus;

  @CreateDateColumn({ type: 'timestamp', nullable: true, comment: '생성일' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true, comment: '수정일' })
  updated_at: Date;

  @Column({ type: 'bigint', comment: '일반형 관리자 FK' })
  manager_general_id: number;

  @Column({ type: 'bigint', comment: '공공형 관리자 FK' })
  manager_public_id: number;

  @ManyToOne('LocalManagerGeneral', 'employers')
  @JoinColumn({ name: 'manager_general_id' })
  generalManager: any;

  @ManyToOne('LocalManagerPublic', 'employers')
  @JoinColumn({ name: 'manager_public_id' })
  publicManager: any;

  @OneToMany('SeasonWorker', 'employer')
  workers: any[];

  @OneToMany('Payment', 'employer')
  payments: any[];
}
