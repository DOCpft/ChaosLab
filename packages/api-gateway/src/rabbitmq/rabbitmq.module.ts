import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices'
import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
    imports: [
        // ClientsModule.register([
        //     {
        //         name: 'RABBITMQ_CLIENT',
        //         transport: Transport.RMQ,
        //         options: {
        //             urls: [process.env.RABBITMQ_URL || 'amqp://chaos_user:chaos_password@localhost:5672'],
        //             exchange: 'chaos.exchange',
        //             exchangeType: 'topic',
        //             routingKey: 'chaos.orchestrator',
        //             noAck: true, // пока нет оркестратора
        //             persistent: true
        //         }
        //     }
        // ]),
        RabbitMQModule.forRoot({
            uri: process.env.RABBITMQ_URL || 'amqp://chaos_user:chaos_password@localhost:5672',
            exchanges: [{name: 'chaos.exchange', type: 'topic'}],
            connectionInitOptions: {
                timeout: 1000
            },
        }),
    ],

    exports: [
        RabbitMQModule,
        RabbitMQService
    ],

    providers: [RabbitMQService]
})
export class RabbitmqModule {}
