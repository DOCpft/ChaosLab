import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller('rabbitmq')
export class RabbitmqController {

    @MessagePattern('#')
    handleExperimentStart(@Payload() data: any, @Ctx() context: RmqContext) {
        console.log(`Получено сообщение: ${JSON.stringify(data)}`);
        
    }

    @MessagePattern('experiment.stop')
    handleExperimentStop(@Payload() data: any, @Ctx() context: RmqContext) {
        console.log(`Получено сообщение: ${JSON.stringify(data)}`);

        
    }
}
