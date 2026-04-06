import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://chaos_user:chaos_password@localhost:5672'],
      queue: 'orchestrator_queue',
      queueOptions: {
        durable: false
      },
      noAck: false,
    },
  });
  await app.listen().finally(() => {
    console.log('Orchestrator microservice is listening...');
  });
}
bootstrap();
