import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { UserLoginDto } from './dto/login-user.dto';
import { UserRegisterDto } from './dto/register-user.dto';
import { UserLoginResponseDto } from './dto/login-user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: UserLoginDto): Promise<UserLoginResponseDto | null> {
    const user = await this.usersService.findByUsername(loginDto.username);
    if (user && (await bcrypt.compare(loginDto.password, user.passwordHash))) {
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, experiments, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserById(id: number): Promise<UserLoginResponseDto | null>{
    const user = await this.usersService.findById(id);

    if(user){
      const { passwordHash, experiments, ...result } = user
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(registerDto: UserRegisterDto) {
    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    return await this.usersService.create(registerDto.username, passwordHash, registerDto.role);
  }
}
