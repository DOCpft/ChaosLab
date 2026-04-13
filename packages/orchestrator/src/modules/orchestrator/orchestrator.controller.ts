import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { type MessageOfQueue } from 'src/common/message-of-queue.interface';
import { OrchestratorService } from './orchestrator.service';

@Controller('orchestrator')
export class OrchestratorController {
    private readonly logger = new Logger(OrchestratorController.name);

    constructor(private readonly orchestratorService: OrchestratorService) {}
    @MessagePattern('experiment.start')
    async handleStartExperimentMessage(data: MessageOfQueue) {
        this.logger.log(`Получено сообщение от API-Gateway: ${JSON.stringify(data)}`);
        try {
            const result = await this.orchestratorService.handleStart(data);
            if(result.success) {
                this.logger.log(`Experiment successfully started for agent ${data.targetAgentId}`);
            } else {
                this.logger.error(`Error starting experiment for agent ${data.targetAgentId}: ${result.message}`);
            }
        } catch (error) {
            this.logger.error(`Error processing message from API-Gateway: ${error}`);
        }
    }

    @MessagePattern('experiment.stop')
    async handleStopExperimentMessage(data: MessageOfQueue) {
        this.logger.log(`Получено сообщение от API-Gateway: ${JSON.stringify(data)}`);
        try {
            const result = await this.orchestratorService.handleStop(data);
            if(result.success) {
                this.logger.log(`Experiment successfully stopped for agent ${data.targetAgentId}`);
            } else {
                this.logger.error(`Error stopping experiment for agent ${data.targetAgentId}: ${result.message}`);
            }
        } catch (error) {
            this.logger.error(`Error processing message from API-Gateway: ${error}`);
        }
    }
}
