import { FaultType } from "../experiment.entity";


export class CreateExperimentDto {
    name!: string;

    faultType!: FaultType;

    params?: Record<string, any>;

    durationSeconds!: number;

    targetAgentId?: string;
}