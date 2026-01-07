import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn({ name: 'admin_id', type: 'bigint', comment: '관리자 PK' })
  admin_id: number;

  @Column({ type: 'varchar', comment: 'PIN코드' })
  password: string;

  @Column({ type: 'varchar', default: '전체관리자', comment: '관리자이름' })
  name: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true, comment: '생성일' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true, comment: '수정일' })
  updated_at: Date;

  @OneToMany('LocalManagerGeneral', 'admin')
  generalManagers: any[];

  @OneToMany('LocalManagerPublic', 'admin')
  publicManagers: any[];
}
