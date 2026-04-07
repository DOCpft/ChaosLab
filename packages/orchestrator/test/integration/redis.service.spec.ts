import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../../src/redis/redis.service';
import { RedisContainer } from '@testcontainers/redis';
import Redis from 'ioredis';
import { RedisLock } from 'src/common/redis-lock.interface';
import { Logger } from '@nestjs/common';


describe('RedisService (integration)', () => {
  let service: RedisService;
  let redisClient: Redis;
  let container: any;

  beforeAll(async () => {
    //container = await new RedisContainer('redis:8').start();
    redisClient = new Redis({ host: 'localhost', port: 6379 });
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: 'REDIS_CLIENT', useValue: redisClient },
      ],
    }).setLogger(new Logger()).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  beforeEach(async () => {
    // Очищаем Redis перед каждым тестом
    await redisClient.flushall();
  });

  it('should acquire lock only once', async () => {
    const key = 'lock:resource';
    const lockValue: RedisLock = {            
        experimentId: '12435fdh',
        faultType: 'latency',
        params: '{ms: 100}',
        duration: 100,
        targetAgentId: 'rthrth5',
        userId: 'bob',
        
     };

    // Первый захват – успех
    const result1 = await service.setLock(key, lockValue, 10);
    expect(result1).toBe(true);

    // Второй захват – неудача (ключ уже существует)
    const result2 = await service.setLock(key, lockValue, 10);
    expect(result2).toBe(false);

    // Проверяем, что значение действительно сохранилось
    const stored = await service.get(key);
    expect(stored).toEqual(lockValue);
  });

  it('should return null for non-existing lock', async () => {
    const value = await service.get('absent');
    expect(value).toBeNull();
  });

  it('should delete lock', async () => {
    const key = 'lock:toDelete';
    const value: RedisLock = {
        experimentId: '155fdh',
        faultType: 'error',
        params: '{ms: 228}',
        duration: 155,
        targetAgentId: 'rthrth5',
        userId: 'bobik',
    }
    await service.setLock(key, value, 30);
    
    await service.del(key);
    
    const afterDelete = await service.get(key);
    expect(afterDelete).toBeNull();
  });

  it('should respect TTL', async () => {
    const key = 'lock:ttl';
    const value: RedisLock = {
        experimentId: '12435fdh',
        faultType: 'latency',
        params: '{ms: 100}',
        duration: 100,
        targetAgentId: 'rthrth5',
        userId: 'bob',
    }
    await service.setLock(key, value, 1); // 1 секунда

    let lock = await service.get(key);
    expect(lock).not.toBeNull();

    await new Promise(resolve => setTimeout(resolve, 1100));

    lock = await service.get(key);
    expect(lock).toBeNull();
  });
});