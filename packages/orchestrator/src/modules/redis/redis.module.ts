import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Module({})
export class RedisModule {
    static forRootAsync() : DynamicModule {
        const redisProvider: Provider = {
            provide: 'REDIS_CLIENT',
            useFactory: (configService: ConfigService) => {
                const redisUrl = configService.get<string>('REDIS_URL', process.env.REDIS_URL || 'redis://localhost:6379');
                return new Redis(redisUrl);
            },
            inject: [ConfigService],
        };

        return {
            module: RedisModule,
            providers: [redisProvider, RedisService],
            exports: [RedisService]
        };
    }
}
