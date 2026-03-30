import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, IsNull, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum StatusExperiment {
    CREATED = 'created',
    RUNNING = 'running',
    STOPPED = 'stopped',
    FINISHED = 'finished',
    FAILED = 'failed'
}

export enum FaultType {
    LATENCY = 'latency',
    ERROR = 'error',
    FAILURE = 'failure'
}

@Entity("experiments")
export class Experiment {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "enum", enum: FaultType })
    faultType!: FaultType;
    
    @Column({ type: "jsonb" })
    params!: Record<string, any>;

    @Column({ type: "int" })
    duration!: number;

    @Column({ type: "uuid" })
    targetAgentId!: string; // Сделаем еще одну сущность

    @Column({ type: "enum", enum: StatusExperiment, default: StatusExperiment.CREATED })
    statusExperiment!: StatusExperiment;

    @ManyToOne(() => User, (user) => user.experiments)
    @JoinColumn({ name: 'createdById' })
    createdBy!: User;

    @Column({ nullable: true }) // Временно для dev
    createdById?: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt?: Date;
}