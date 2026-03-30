import { User } from 'src/users/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum ExperimentStatus {
  CREATED = 'created',
  RUNNING = 'running',
  STOPPED = 'stopped',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum FaultType {
  LATENCY = 'latency',
  ERROR = 'error',
  FAILURE = 'failure',
}
@Entity('experiments')
export class ExperimentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: FaultType })
  faultType: FaultType;

  @Column('jsonb')
  parameters: Record<string, any>;

  @Column({ type: 'int' })
  duration: number; // in seconds

  @Column({ type: 'varchar' })
  targetAgentId: string;

  @Column({ type: 'enum', enum: ExperimentStatus, default: ExperimentStatus.CREATED })
  status: ExperimentStatus;

  @ManyToOne(() => User, (user) => user.experiments)
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
