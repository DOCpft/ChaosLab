import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ExperimentsService } from 'src/modules/experiments/experiments.service';

@Controller('rabbitmq')
export class RabbitmqController {

    private readonly logger = new Logger(RabbitmqController.name);

    constructor(private readonly experimentService: ExperimentsService) {}
    @MessagePattern('experiment.completed')
    async handleExperimentCompleted(data: { message: string, experimentId: string }) {
        this.logger.log('Получено сообщение о завершении эксперимента: ' + JSON.stringify(data));
        try {
            await this.experimentService.markExperimentAsCompleted(data.experimentId);
            this.logger.log('Эксперимент с ID ' + data.experimentId + ' помечен как завершенный');
        } catch (error) {
            this.logger.error(error);
        }
    }

}
