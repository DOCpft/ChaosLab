import { ApiProperty } from "@nestjs/swagger";
import { CreateExperimentDto } from "../requests/create-experiment-dto";

export class CreateExperimentResponseDto {
    @ApiProperty({ description: "Статус выполненной операции" })
    statusCode: number;

    @ApiProperty({ description: "Сообщение о результате" })
    message: string;

    @ApiProperty({ description: "Полученные данные" })
    data?: CreateExperimentDto
}