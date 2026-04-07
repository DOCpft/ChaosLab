import { ApiProperty } from "@nestjs/swagger";
import { UserCreateDto } from "src/users/dto/responses/create-user.dto";

export class UserLoginResponseDto {
    @ApiProperty({ description: 'Статус операции' })
    statusCode: number;

    @ApiProperty({ description: 'Сообщение о результате' })
    message: string;

    @ApiProperty({ description: 'Полученные данные' })
    access_token?: string;
}