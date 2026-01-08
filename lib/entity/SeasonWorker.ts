import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AccountStatus } from './LocalManagerPublic';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F'
}

export enum RegisterStatus {
  IMMIGRATION = 'IMMIGRATION',
  MOU = 'MOU',
  MARRIAGE = 'MARRIAGE',
  PUBLIC = 'PUBLIC',
  OTHER = 'OTHER',
  NONE = 'NONE'
}

@Entity('season_worker')
export class SeasonWorker {
  @PrimaryGeneratedColumn({ name: 'worker_id', type: 'bigint', comment: '노동자 PK' })
  worker_id: number;

  @Column({ type: 'varchar', comment: 'PIN코드' })
  password: string;

  @Column({ type: 'varchar', comment: '출신국가코드' })
  country_code: string;

  @Column({ type: 'varchar', comment: '여권번호' })
  passport_id: string;

  @Column({ type: 'varchar', nullable: true, comment: '여권만료날짜' })
  passport_expired: string;

  @Column({ type: 'varchar', comment: '여권상 이름' })
  name: string;

  @Column({ type: 'date', comment: '생년월일' })
  birth_date: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    comment: '성별'
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: RegisterStatus,
    default: RegisterStatus.NONE,
    comment: '가입유형'
  })
  register_status: RegisterStatus;

  @Column({ type: 'varchar', nullable: true, comment: '외국인등록번호' })
  resident_id: string;

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

  @Column({ type: 'bigint', comment: '공공형 관리자 FK' })
  manager_public_id: number;

  @Column({ type: 'bigint', comment: '사업자 FK' })
  employer_id: number;

  @Column({ type: 'varchar', nullable: true, comment: '계좌번호' })
  bank_account: string;

  @ManyToOne('LocalManagerPublic', 'workers')
  @JoinColumn({ name: 'manager_public_id' })
  publicManager: any;

  @ManyToOne('Employer', 'workers')
  @JoinColumn({ name: 'employer_id' })
  employer: any;

  @OneToMany('Country', 'worker')
  countries: any[];


  @Column({ type: 'varchar', length: 20, comment: '비자유형 코드', nullable: true })
  visa_code: string;

  @ManyToOne('VisaStatus')
  @JoinColumn({ name: 'visa_code', referencedColumnName: 'visa_code' })
  visaStatus: any;

  @OneToMany('Insurance', 'worker')
  insurances: any[];
}
