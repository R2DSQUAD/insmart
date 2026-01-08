import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

export enum AccountStatus {
  ACTIVE = 'Active',
  ACTIVE_PENDING = 'ActivePending',
  CANCEL = 'Cancel',
  CANCEL_PENDING = 'CancelPending'
}

@Entity('local_manager_public')
export class LocalManagerPublic {
  @PrimaryGeneratedColumn({ name: 'manager_public_id', type: 'bigint', comment: '공공형 관리자 PK' })
  manager_public_id: number;

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

  @ManyToOne('Admin', 'publicManagers')
  @JoinColumn({ name: 'admin_id' })
  admin: any;

  @OneToMany('LocalGovernment', 'publicManager')
  localGovernments: any[];

  @OneToMany('Employer', 'publicManager')
  employers: any[];

  @OneToMany('SeasonWorker', 'publicManager')
  workers: any[];
}
