import { ApiProperty } from "@nestjs/swagger";
import { UpdateExperimentDto } from "../requests/update-experiment-dto";

export class UpdateExperimentResponseDto {
    @ApiProperty({ description: "Статус выполненной операции" })
    statusCode: number;

    @ApiProperty({ description: "Сообщение о результате" })
    message: string;

    @ApiProperty({ description: "Полученные данные" })
    data?: UpdateExperimentDto
}