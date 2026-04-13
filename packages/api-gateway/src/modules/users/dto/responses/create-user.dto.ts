import { ApiProperty } from "@nestjs/swagger";

export class UserCreateDto {
    @ApiProperty({ description: 'Логин пользователя' })
    username!: string;

    @ApiProperty({ description: 'Роль пользователя' })
    role!: string;
}