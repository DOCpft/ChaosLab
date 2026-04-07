import { Injectable, Logger } from '@nestjs/common';
import { MessageOfQueue } from 'src/common/message-of-queue.interface';
import { RedisLock } from 'src/common/redis-lock.interface';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class OrchestratorService {
    private readonly logger = new Logger(OrchestratorService.name);
    // Чтобы понимать когда нужно отправить сообщение в очередь
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


    async handleStart( data: MessageOfQueue ): Promise<{ success: boolean, message?: string }> {
            const lockKey = `agent:${data.targetAgentId}:lock`;

            const redisValue: RedisLock = {
                experimentId: data.experimentId,
                faultType: data.faultType,
                params: data.params,
                duration: data.duration,
                targetAgentId: data.targetAgentId,
                userId: data.userId
            };

            const lockedExists = await this.redisService.get(lockKey);
            if(lockedExists !== null) {
                this.logger.log(`Key ${lockKey} already exists by user ${lockedExists.userId}`);
                return { success: false, message: `Key ${lockKey} already exists` };
            }
            
            try {
                await this.redisService.set(lockKey, JSON.stringify(redisValue));
                await this.createTimer(lockKey, data.duration);
            } catch (err) {
                this.logger.error(`Error setting key ${lockKey}: ${err}`);
                return { success: false, message: `Error setting key ${lockKey}: ${err}` };
            }

            
            return { success: true };

    }
}
