import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices'

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'RABBITMQ_CLIENT',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL || 'amqp://chaos_user:chaos_password@localhost:5672'],
                    queue: 'orchestrator_queue',
                    queueOptions: {
                        durable: true
                    },
                    noAck: true, // пока нет оркестратора
                    persistent: true
                }
            }
        ]),
    ],

    exports: [
        ClientsModule,
    ]
})
export class RabbitmqModule {}
