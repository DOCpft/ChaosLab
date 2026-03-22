import { Body, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User> {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      // Логируем оригинальную ошибку
      console.error('Database error:', error);
      // Выбрасываем новое исключение с более общим сообщением
      throw new Error('Failed to fetch user');
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await this.usersRepository.findOneBy({ username });
      if (!user) {
        throw new Error(`User with username ${username} not found`);
      }
      return user;
    } catch (error) {
      // Логируем оригинальную ошибку
      console.error('Database error:', error);
      // Выбрасываем новое исключение с более общим сообщением
      throw new Error('Failed to fetch user');
    }
  }

  async create(
    username: string,
    passwordHash: string,
    role: string = 'user',
  ): Promise<User> {
    try {
      const user = this.usersRepository.create({
        username,
        passwordHash,
        role,
      });
      return await this.usersRepository.save(user);
    } catch (error) {
      // Логируем ошибку для диагностики
      console.error('Failed to create user:', error);

      // Преобразуем ошибку в понятное исключение
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error(`User with username "${username}" already exists`);
      }

      // Общая ошибка базы данных
      throw new InternalServerErrorException('Unable to create user');
    }
  }
}
