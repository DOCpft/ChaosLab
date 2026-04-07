import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisLock } from 'src/common/redis-lock.interface';

@Injectable()
export class RedisService {
    private readonly logger = new Logger(RedisService.name);

    constructor(@Inject('REDIS_CLIENT') private redisClient: Redis) {
        this.logger.log('RedisService initialized');
    }

    async setLock(key: string, value: RedisLock, ttl: number): Promise<boolean> {
        this.logger.log(`Setting lock for key ${key} with value ${value} and ttl ${ttl}`);
        try {
            const result = await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl, 'NX');
            // 'NX' гарантирует, что блокировка установится только если ключа нет
            this.logger.log(`Lock set result: ${result}`);
            return result === 'OK';
        } catch (error) {
            this.logger.error(`Redis error while setting lock for key ${key}: ${error}`);
            // Пробрасываем дальше, чтобы вызывающий знал о проблеме с Redis
            throw new Error(`Failed to set lock for key ${key}: ${error}`);
        }
    }

    
    // Пока что не вижу необходимости в releaseLock, может быть увижу далее
    // async releaseLock(key: string, value?: string): Promise<void> {
    //     if(value) {
    //         // Возможно в дальнейшем нужно будет обновлять блокировку. Пока что заглушка, но заложим возможность обновлять блокировку
    //     } else {
    //         await this.del(key);   
    //     }
    // }

    async get(key: string): Promise<RedisLock | null> {
        this.logger.log(`Getting value for key ${key}`);
        try {
            const value = await this.redisClient.get(key);
            // value === null означает, что ключа нет (блокировка отсутствует)
            if (value === null) {
                this.logger.debug(`Key ${key} not found (no lock)`);
                // Можно выбросить специальную ошибку
                return null;
            }
            return JSON.parse(value);
        } catch (error) {
            // Сюда попадаем только при реальных проблемах: сеть, Redis недоступен, таймаут и т.п.
            this.logger.error(`Redis connection error for key ${key}: ${error}`);
            throw new Error(`Failed to get key ${key} from Redis: ${error}`);
        }
    
    }

    // Возможно нам этот метод не нужен
    async set(key: string, value: string, ttl?: number): Promise<void> {
        if(ttl) {
            this.logger.log(`Setting key ${key} with value ${value} and ttl ${ttl}`);
            try {
                const isLocked = await this.redisClient.set(key, value, 'EX', ttl, 'NX');
                if(isLocked !== 'OK') {
                    this.logger.log(`Locked for key: ${key} is already exists`);
                }
            } catch (error) {
                this.logger.error(`Redis connection error for key ${key}: ${error}`);
                throw new Error(`Failed to set key ${key} in Redis: ${error}`);
            }
        } else {
            await this.redisClient.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        try {
            this.logger.log(`Deleting key ${key}`);
            const cnt = await this.redisClient.del(key);
            if(cnt === 0) {
                this.logger.log(`Key ${key} not found (no lock)`);
            }
        } catch (error) {
            this.logger.error(`Redis connection error for key ${key}: ${error}`);
            throw new Error(`Failed to delete key ${key} from Redis: ${error}`);
        }
    }

}
