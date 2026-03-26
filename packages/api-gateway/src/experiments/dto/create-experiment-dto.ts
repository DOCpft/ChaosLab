import { FaultType } from "../experiment.entity";


export class CreateExperimentDto {
    name!: string;

    faultType!: FaultType;

    params?: Record<string, any>;

    duration!: number;

    targetAgentId?: string;
}