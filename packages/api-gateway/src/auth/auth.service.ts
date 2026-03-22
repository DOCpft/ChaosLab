import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<{ username: string; role: string } | null> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: string) {
    const payload = { username: user };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(username: string, password: string, role?: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    return await this.usersService.create(username, passwordHash, role);
  }
}
