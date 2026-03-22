import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (!user) {
      return { statusCode: 401, message: 'Invalid credetials' };
    }
    await this.authService.login(user.username);
    return { statusCode: 200, message: 'Access is allowed' }
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(
    @Body() body: { username: string; password: string; role?: string },
  ) {
    const user = await this.authService.register(
      body.username,
      body.password,
      body.role,
    );
    if(!user) {
        return { statusCode: 401, message: "Register failed"}
    }
    return { statusCode: HttpStatus.OK, message: "Register is successfully"}
  }
}
