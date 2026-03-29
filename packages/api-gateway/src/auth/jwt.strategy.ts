import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { JwtPayload } from 'common/types/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: JwtPayload) {
    // payload содержит данные, зашитые в JWT (например, { sub: userId, username })
    // Здесь можно проверить, существует ли пользователь в БД
    //@typescript-eslint/no-unsafe-assignment
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) {
      return null;
    }
    return user; // прикрепляется к request.user
  }
}
