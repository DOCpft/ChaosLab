import { FaultType } from "../experiment.entity";


export class UpdateExperimentDto {
    name?: string;
    
    faultType?: FaultType;
        
    params?: Record<string, any>;
    
    duration?: number;
    
    targetAgentId?: string; // Сделаем еще одну сущность
    
}