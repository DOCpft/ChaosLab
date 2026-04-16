import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
 async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({  // Пока что будет гибридным приложением, в котором будет и API, и микросервис для обработки сообщений из RabbitMQ. В дальнейшем, возможно, стоит разделить на два отдельных приложения.
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://chaos_user:chaos_password@localhost:5672'],
      queue: 'api_gateway_queue',
      exchange: 'chaos.exchange',
      exchangeType: 'topic',
      routingKey: 'chaos.api_gateway', // binding
      queueOptions: {
        durable: true
      },
      noAck: true,
    
  }, });


  const config = new DocumentBuilder()
                    .setTitle('ChaosLab API')
                    .setDescription('API для управления экспериментами по хаос-инжинирунгу')
                    .setVersion('1.0')
                    .addBearerAuth()
                    .build();
  
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT ?? 3000);

  await app.startAllMicroservices();
}
bootstrap();
