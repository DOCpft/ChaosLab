import { ApiProperty } from "@nestjs/swagger";

export class UserRegisterDto {
    @ApiProperty({ description: 'Логин пользователя' })
    username!: string;
    
    @ApiProperty({ description: 'Пароль пользователя' })
    password!: string;

    @ApiProperty({ required: false, description: 'Роль пользователя' })
    role?: string;
}