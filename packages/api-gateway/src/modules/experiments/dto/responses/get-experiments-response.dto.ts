import { ApiProperty } from "@nestjs/swagger";
import { GetExperimentDto } from "./get-experiment.dto";

export class GetExperimentsResponseDto {
    @ApiProperty({ description: "Статус ответа" })
    statusCode: number;

    @ApiProperty({ description: "Сообщение о результате операции" })
    message: string;

    @ApiProperty({ description: "Полученные данные" })
    data?: GetExperimentDto | GetExperimentDto[]
}