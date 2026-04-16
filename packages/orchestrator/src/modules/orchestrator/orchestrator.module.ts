import { Module } from '@nestjs/common';
import { RedisModule } from 'src/modules/redis/redis.module';
import { OrchestratorService } from './orchestrator.service';
import { OrchestratorController } from './orchestrator.controller';
import { RabbitmqModule } from 'src/modules/rabbitmq/rabbitmq.module';

@Module({
    imports: [RedisModule.forRootAsync(), RabbitmqModule],
    providers: [OrchestratorService],
    controllers: [OrchestratorController]
})
export class OrchestratorModule {}
