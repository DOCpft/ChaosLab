import { Injectable, Logger } from '@nestjs/common';
import { MessageOfQueue } from 'src/common/message-of-queue.interface';
import { RabbitMQService } from 'src/modules/rabbitmq/rabbitmq.service';
import { RedisService } from 'src/modules/redis/redis.service';

@Injectable()
export class OrchestratorService {
    private readonly logger = new Logger(OrchestratorService.name);
    // При принудительной остановке эксперимента нужно будет очистить таймер, который был установлен при запуске эксперимента.
    // Для этого будем хранить активные таймеры в Map, где ключом будет идентификатор эксперимента или агента, а значением - объект таймера.
    private activeTimers: Map<string, NodeJS.Timeout> = new Map();
    constructor(
        private readonly redisService: RedisService,
        private readonly rabbitMQService: RabbitMQService
    ) {}

    
    // Запускает таймер для завершения эксперимента по таймеру.
    private async createTimer(key: string, ttl: number, experimentId: string): Promise<void> {
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

            // Отправляем сообщение о завершении эксперимента в API-Gateway
            try {
                await this.rabbitMQService.sendMessage('experiment.completed', experimentId);
                this.logger.log(`Sent experiment.completed message for experiment ${experimentId}`);
            } catch (err) {
                this.logger.error(`Error sending experiment.completed message for experiment ${experimentId}: ${err}`);
            }
        }, ttl);
        this.activeTimers.set(key, timer);
    }

    
    // Обработка сообщения о запуске эксперимента
    async handleStart( data: MessageOfQueue ): Promise<{ success: boolean, message?: string }> {
            const lockKey = `agent:${data.targetAgentId}:lock`;

            const lockedExists = await this.redisService.get(lockKey);
            if(lockedExists !== null) {
                this.logger.log(`Key ${lockKey} already exists by user ${lockedExists.userId}`);
                return { success: false, message: `Key ${lockKey} already exists` };
            }
            
            try {
                await this.redisService.set(lockKey, JSON.stringify(data));
                await this.createTimer(lockKey, data.duration, data.experimentId);
                this.logger.log(`Key ${lockKey} set successfully with value ${JSON.stringify(data)} and timer created`);
            } catch (err) {
                this.logger.error(`Error setting key ${lockKey}: ${err}`);
                return { success: false, message: `Error setting key ${lockKey}: ${err}` };
            }

            // Далее будет отправка сообщения агенту со стартом эксперимента
            return { success: true };
    }


    // Принудительная остановка эксперимента
    async handleStop( data: MessageOfQueue ): Promise<{ success: boolean, message?: string }> {
        const lockKey = `agent:${data.targetAgentId}:lock`;

        const lockedExists = await this.redisService.get(lockKey);
        // Блокировки нет, эксперимент не запущен или уже завершён
        if(lockedExists === null) {
            this.logger.log(`Key ${lockKey} does not exist`);
            return { success: false, message: `Key ${lockKey} does not exist. Experiment not running or completed` };
        }

        try {
            await this.redisService.del(lockKey);
            const timer = this.activeTimers.get(lockKey);
            if(timer) {
                clearTimeout(timer);
                this.activeTimers.delete(lockKey);
            }
            this.logger.log(`Key ${lockKey} deleted successfully. Experiment stopped.`);
        } catch (err) {
            this.logger.error(`Error deleting key ${lockKey}: ${err}`);
            return { success: false, message: `Error deleting key ${lockKey}: ${err}` };
        }


        // Далее будет отправка сообщения агенту со стопом эксперимента
        return { success: true };
    }


}
