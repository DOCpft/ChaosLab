import { ApiProperty } from "@nestjs/swagger";

export class UserLoginResponseDto {
    @ApiProperty({ description: 'Логин пользователя' })
    username!: string;

    @ApiProperty({ description: 'Роль пользователя' })
    role!: string;
}