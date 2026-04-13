import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserValidateDto } from './dto/requests/user-validate.dto';
import { UserRegisterDto } from './dto/requests/register-user.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRegisterResponseDto } from './dto/responses/user-register-response.dto';
import { UserLoginResponseDto } from './dto/responses/user-login-response.dto';

@ApiTags('authenticate')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Авторизовать пользователя" })
  @ApiBody({ type: UserValidateDto })
  @ApiResponse({type: UserLoginResponseDto})
  async login(@Body() loginDto: UserValidateDto): Promise<UserLoginResponseDto> {
    const user = await this.authService.validateUser(loginDto);
    let result = new UserLoginResponseDto();
    if (!user) {
      result = { statusCode: HttpStatus.UNAUTHORIZED, message: 'Invalid credetials' };
      return result;
    }
    const access_token = await this.authService.login(user);
    result = { statusCode: 200, message: 'Access is allowed', access_token: access_token };
    return result;
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Зарегистрировать пользователя" })
  @ApiBody({ type: UserRegisterDto })
  @ApiResponse({ status: HttpStatus.OK,  type: UserRegisterResponseDto })
  async register(
    @Body() registerDto: UserRegisterDto,
  ): Promise<UserRegisterResponseDto> {
    const user = await this.authService.register(registerDto);
    let result: UserRegisterResponseDto = new UserRegisterResponseDto();
    if(!user) {
        result = { statusCode: HttpStatus.UNAUTHORIZED, message: "Register failed"}
        return result;
    }
    result = { statusCode: HttpStatus.OK, message: "Register is successfully", data: user}
    return result;
  }
}
