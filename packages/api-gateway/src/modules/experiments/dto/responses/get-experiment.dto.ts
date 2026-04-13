import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator";
import { FaultType, StatusExperiment } from "src/database/experiment.entity";

export class GetExperimentDto {
    @ApiProperty({ description: "ID эксперимента" })
    id?: string;

    @ApiProperty({ description: "Название эксперимента" })
    name?: string;

    @ApiProperty({ enum: FaultType, description: "Тип ошибки" })
    faultType?: FaultType;

    @ApiProperty({ required: false, description: "Указания для агента, например {ms: 300}" })
    params?: Record<string, any>;

    @ApiProperty({ description: "Длительность эксперимента" })
    duration?: number;

    @ApiProperty({ description: "Целевой агент" })
    targetAgentId?: string;

    @ApiProperty({ enum: StatusExperiment, description: "Статус эксперимента" })
    statusExperiment?: StatusExperiment;

    @ApiProperty({ description: "Создатель эксперимента" })
    createdBy?: string;

    @ApiProperty({ description: "ID создателя эксперимента" })
    createdById?: number;

    @ApiProperty({ description: "Дата создания эксперимента" })
    createdAt?: Date;

    @ApiProperty({ description: "Дата обновления эксперимента" })
    updatedAt?: Date;
}