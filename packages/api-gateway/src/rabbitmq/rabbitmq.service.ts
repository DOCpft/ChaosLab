import { Inject, Injectable } from '@nestjs/common';
import { IBrokerService } from '../../common/abstract/IBrokerService.interface';
import { ClientProxy } from '@nestjs/microservices';
import { Experiment } from 'src/experiments/experiment.entity';
import { User } from 'src/users/user.entity';
import { MessageToQueue } from 'common/types/message-broker.interface';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitMQService implements IBrokerService {
    constructor(private readonly rabbitmqClient: AmqpConnection) {} // @Inject('RABBITMQ_CLIENT') private readonly rabbitmqClient: ClientProxy
    async sendMessage(type: string, experiment: Experiment, user: User){
        const message = {
            pattern: type,

            data: {
                experimentId: experiment.id, 
                faultType: experiment.faultType,
                params: experiment.params,
                duration: experiment.duration,
                targetAgentId: experiment.targetAgentId,
                userId: user.id,
            }
        };
        
        try {
            await this.rabbitmqClient.publish('chaos.exchange', 'chaos.orchestrator', message);
        } catch (err) {
            console.error("Failed to publish RabbitMQ message", err);
        }


        // this.rabbitmqClient.emit(type, message).subscribe({
        //     error: (err) => console.error("Failed to emit RabbitMQ message", err),
        //     complete: () => {
        //         console.log("Successfully sended RabbitMQ message");
        //     } 
        // });
    }
}
