import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperimentsModule } from './experiments/experiments.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT!, 10) || 5433,
      username: process.env.DB_USER || 'chaos',
      password: process.env.DB_PASSWORD || 'chaos_password',
      database: process.env.DB_NAME || 'chaos_experiments_db',
      autoLoadEntities: true,
      synchronize: true, // только для разработки
    }),
    AuthModule,
    UsersModule,
    ExperimentsModule,
    RabbitmqModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
