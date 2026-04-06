import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { OrchestratorService } from './orchestrator.service';

@Module({
    imports: [RedisModule],
    providers: [OrchestratorService]
})
export class OrchestratorModule {}
