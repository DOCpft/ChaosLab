import { Experiment } from 'src/experiments/experiment.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  passwordHash!: string;

  @Column({ default: 'user' })
  role!: string;

  @OneToMany(() => Experiment, (experiment) => experiment.createdBy)
  experiments?: Experiment[]
}
