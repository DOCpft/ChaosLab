import { FaultType } from "src/experiments/experiment.entity";

export interface MessageToQueue {
    type: string;
    experimentId: string;
    faultType: FaultType;
    params: any;
    duration: number;
    targetAgentId: string;
    userId: number
}

