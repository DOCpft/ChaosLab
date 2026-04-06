import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class OrchestratorService {
    private readonly logger = new Logger(OrchestratorService.name);
    private activeTimers: Map<string, NodeJS.Timeout> = new Map();
    constructor(private readonly redisService: RedisService) {}

    
}
