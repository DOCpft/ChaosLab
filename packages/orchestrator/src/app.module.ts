import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrchestratorModule } from './modules/orchestrator/orchestrator.module';
import { RedisModule } from './modules/redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { RabbitmqModule } from './modules/rabbitmq/rabbitmq.module';
import { ClickhouseModule } from './modules/clickhouse/clickhouse.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    OrchestratorModule,
    RedisModule.forRootAsync(),
    RabbitmqModule,
    ClickhouseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
