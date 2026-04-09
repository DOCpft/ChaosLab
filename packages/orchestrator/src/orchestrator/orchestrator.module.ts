import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { OrchestratorService } from './orchestrator.service';
import { OrchestratorController } from './orchestrator.controller';

@Module({
    imports: [RedisModule.forRootAsync()],
    providers: [OrchestratorService],
    controllers: [OrchestratorController]
})
export class OrchestratorModule {}
