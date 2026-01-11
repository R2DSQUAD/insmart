import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AccountStatus, LocalManagerPublic } from './LocalManagerPublic';
import { Country } from './Country';
import { Employer } from './Employer';
import { Insurance } from './Insurance';

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
  @ManyToOne(() => Country, { eager: false })
  @JoinColumn({ name: 'country_code', referencedColumnName: 'country_code' })
  country: Country;
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
  bank_account_no: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '은행명' })
  bank_name: string;


  @ManyToOne(() => LocalManagerPublic, (manager) => manager.workers)
  @JoinColumn({ name: 'manager_public_id' })
  publicManager: LocalManagerPublic;


  @ManyToOne(() => Employer, (employer) => employer.workers)
  @JoinColumn({ name: 'employer_id' })
  employer: Employer;

  @Column({
    type: 'enum',
    enum: ['IMMIGRATION', 'MOU', 'MARRIAGE', 'PUBLIC', 'OTHER', 'NONE'],
    default: 'NONE',
    comment: '비자유형(이민자, MOU, 결혼이주, 공공형, 기타, NONE)'
  })
  visa_status: 'IMMIGRATION' | 'MOU' | 'MARRIAGE' | 'PUBLIC' | 'OTHER' | 'NONE';


  @OneToMany(() => Insurance, (insurance) => insurance.worker)
  insurances: Insurance[];
}
