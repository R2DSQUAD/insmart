import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AccountStatus } from './LocalManagerPublic';

@Entity('local_manager_general')
export class LocalManagerGeneral {
  @PrimaryGeneratedColumn({ name: 'manager_general_id', type: 'bigint', comment: '일반형 관리자 PK' })
  manager_general_id: number;

  @Column({ type: 'bigint', comment: '관리자 FK' })
  admin_id: number;

  @Column({ type: 'varchar', comment: 'PIN코드' })
  password: string;

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

  @ManyToOne('Admin', 'generalManagers')
  @JoinColumn({ name: 'admin_id' })
  admin: any;

  @OneToMany('Employer', 'generalManager')
  employers: any[];

  @OneToMany('LocalGovernment', 'generalManager')
  localGovernments: any[];
}
