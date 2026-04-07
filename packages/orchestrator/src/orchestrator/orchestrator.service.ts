import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class OrchestratorService {
    private readonly logger = new Logger(OrchestratorService.name);
    private activeTimers: Map<string, NodeJS.Timeout> = new Map();
    constructor(private readonly redisService: RedisService) {}

    
    // Запускает таймер для удаления ключа из Redis
    async createTimer(key: string, ttl: number): Promise<void> {
        this.logger.log(`Creating timer for key ${key} with ttl ${ttl}`);
        const timer = setTimeout(async () => {
            this.logger.log(`Timer for key ${key} expired`);
            try {
                await this.redisService.del(key);
            } catch (err) {
                this.logger.error(`Error deleting key ${key}: ${err}`);
            } finally {
                this.activeTimers.delete(key);
            }
        }, ttl);
        this.activeTimers.set(key, timer);
    }


    async handleStart(

    ): Promise<void> {
               

    }
}
