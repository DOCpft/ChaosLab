import { ApiProperty } from "@nestjs/swagger";

export class UserLoginDto {
    @ApiProperty({ description: 'Логин пользователя' })
    username!: string;

    @ApiProperty({ description: 'Пароль пользователя' })
    password!: string;
}