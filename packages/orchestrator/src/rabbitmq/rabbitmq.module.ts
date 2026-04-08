import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitmqController } from './rabbitmq.controller';

@Module({
  controllers: [RabbitmqController]
})
export class RabbitmqModule {}
