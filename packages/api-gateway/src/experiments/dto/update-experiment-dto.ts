import { ApiProperty } from "@nestjs/swagger";
import { FaultType } from "../experiment.entity";


export class UpdateExperimentDto {
    @ApiProperty({ description: 'Название эксперимента' })
    name?: string;
    
    @ApiProperty({ description: 'Тип ошибки' })
    faultType?: FaultType;
    
    @ApiProperty({ required: false,  description: 'Указания для агента, например {ms: 300}' })
    params?: Record<string, any>;
    
    @ApiProperty({ description: 'Длительность эксперимента' })
    duration?: number;
    
    @ApiProperty({ description: 'Целевой агент' })
    targetAgentId?: string; // Сделаем еще одну сущность
    
}