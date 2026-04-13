import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot({
            uri: process.env.RABBITMQ_URL || 'amqp://chaos_user:chaos_password@localhost:5672',
            exchanges: [{name: 'chaos.exchange', type: 'topic'}],
            connectionInitOptions: {
                timeout: 1000
            },
        }),
  ],
  providers: [RabbitMQService],
  exports: [RabbitmqModule, RabbitMQService],
})
export class RabbitmqModule {}
