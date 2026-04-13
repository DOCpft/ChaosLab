import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices'
import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitmqController } from './rabbitmq.controller';
import { ExperimentsService } from 'src/modules/experiments/experiments.service';
import { ExperimentsModule } from 'src/modules/experiments/experiments.module';

@Module({
    imports: [
        RabbitMQModule.forRoot({
            uri: process.env.RABBITMQ_URL || 'amqp://chaos_user:chaos_password@localhost:5672',
            exchanges: [{name: 'chaos.exchange', type: 'topic'}],
            connectionInitOptions: {
                timeout: 1000
            },
        }),
        forwardRef(() => ExperimentsModule)
    ],

    exports: [
        RabbitMQModule,
        RabbitMQService
    ],

    providers: [RabbitMQService],

    controllers: [RabbitmqController]
})
export class RabbitmqModule {}
