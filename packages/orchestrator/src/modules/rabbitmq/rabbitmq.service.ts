import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitMQService {
    constructor(private readonly rabbitmqClient: AmqpConnection) {} // @Inject('RABBITMQ_CLIENT') private readonly rabbitmqClient: ClientProxy
    async sendMessage(type: string, experimentId: string){
        const message = {
            pattern: type,

            data: {
                message: `Experiment with ID ${experimentId} has completed`,
                experimentId: experimentId
            }
        };
        
        try {
            await this.rabbitmqClient.publish('chaos.exchange', 'chaos.api_gateway', message);
        } catch (err) {
            console.error("Failed to publish RabbitMQ message", err);
        }
    }
}
