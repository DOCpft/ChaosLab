import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private readonly logger = new Logger(RedisService.name);

    constructor(@Inject('REDIS_CLIENT') private redisClient: Redis) {
        this.logger.log('RedisService initialized');
    }

    async setLock(key: string, value: string, ttl: number): Promise<boolean> {
        this.logger.log(`Setting lock for key ${key} with value ${value} and ttl ${ttl}`);
        const locked = await this.redisClient.set(key, value, 'EX', ttl);
        this.logger.log(`Lock set result: ${locked}`);
        return locked === 'OK';
    }

    async releaseLock(key: string, value?: string): Promise<void> {
        if(value) {
            // Возможно в дальнейшем нужно будет обновлять блокировку. Пока что заглушка, но заложим возможность обновлять блокировку
        } else {
            if(await this.get(key) === value){
                await this.del(key);
            }
        }
    }

    async get(key: string): Promise<string | null> {
        return await this.redisClient.get(key);
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        if(ttl) {
            await this.redisClient.set(key, value, 'EX', ttl);
        } else {
            await this.redisClient.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

}
