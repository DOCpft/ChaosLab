import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/login-user.dto';
import { UserRegisterDto } from './dto/register-user.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('authenticate')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Авторизовать пользователя" })
  @ApiBody({ type: UserLoginDto })
  @ApiResponse({ status: 200, description: 'Пользователь авторизован' })
  async login(@Body() loginDto: UserLoginDto) {
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      return { statusCode: 401, message: 'Invalid credetials' };
    }
    const access_token = await this.authService.login(user.username);
    return { statusCode: 200, message: 'Access is allowed', access_token: access_token };
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Зарегистрировать пользователя" })
  @ApiBody({ type: UserRegisterDto })
  @ApiResponse({ status: 200, description: 'Пользователь зарегистрирован' })
  async register(
    @Body() registerDto: UserRegisterDto,
  ) {
    const user = await this.authService.register(registerDto);
    if(!user) {
        return { statusCode: 401, message: "Register failed"}
    }
    return { statusCode: HttpStatus.OK, message: "Register is successfully"}
  }
}
