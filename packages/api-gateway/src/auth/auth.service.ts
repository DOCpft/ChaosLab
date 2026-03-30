import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { UserValidateDto } from './dto/requests/user-validate.dto';
import { UserRegisterDto } from './dto/requests/register-user.dto';
import { UserCreateDto } from '../users/dto/responses/create-user.dto';
import { UserLoginDto } from 'src/users/dto/responses/login-user.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: UserValidateDto): Promise<UserLoginDto | null> {
    const user = await this.usersService.findByUsername(loginDto.username);
    if (user && (await bcrypt.compare(loginDto.password, user.passwordHash))) {
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, experiments, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserById(id: number): Promise<UserLoginDto | null>{
    const user = await this.usersService.findById(id);

    if(user){
      const { passwordHash, experiments, ...result } = user
      return result;
    }

    return null;
  }

  async login(user: UserLoginDto): Promise<string> {
    const payload = { username: user.username, sub: user.id };
    console.log(` username ${user.username}, id ${user.id}`);
    const access_token = await this.jwtService.signAsync(payload)
    return access_token;
  }

  async register(registerDto: UserRegisterDto): Promise<UserCreateDto> {
    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    
    return await this.usersService.create(registerDto.username, passwordHash, registerDto.role);
  }
}
