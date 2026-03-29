import { ApiProperty } from "@nestjs/swagger";

export class UserLoginDto {
    @ApiProperty({ description: 'ID пользователя' })
    id!: number;

    @ApiProperty({ description: 'Логин пользователя' })
    username!: string;

    @ApiProperty({ description: 'Роль пользователя' })
    role!: string;
}