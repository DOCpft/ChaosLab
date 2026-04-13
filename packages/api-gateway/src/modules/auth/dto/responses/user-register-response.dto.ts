import { ApiProperty } from "@nestjs/swagger";
import { UserCreateDto } from "src/modules/users/dto/responses/create-user.dto";

export class UserRegisterResponseDto {
    @ApiProperty({ description: 'Статус операции' })
    statusCode!: number;

    @ApiProperty({ description: 'Сообщение о результате' })
    message!: string;

    @ApiProperty({ description: 'Полученные данные' })
    data?: UserCreateDto;
}