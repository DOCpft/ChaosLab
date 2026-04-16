import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException, Inject, ConsoleLogger, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, ObjectLiteral, Repository } from 'typeorm';
import { Experiment, FaultType, StatusExperiment } from '../../database/experiment.entity';
import { CreateExperimentDto } from './dto/requests/create-experiment-dto';
import { User } from 'src/database/user.entity';
import { UpdateExperimentDto } from './dto/requests/update-experiment-dto';
import { UpdateResult } from 'typeorm/browser';
import { ClientProxy } from '@nestjs/microservices';
import { MessageToQueue } from 'common/types/message-broker.interface';
import { RabbitMQService } from 'src/modules/rabbitmq/rabbitmq.service';
import { GetExperimentDto } from './dto/responses/get-experiment.dto';

@Injectable()
export class ExperimentsService {
    constructor(
        @InjectRepository(Experiment)
        private readonly experimentRepository: Repository<Experiment>,
        private readonly rabbitmqService: RabbitMQService
    ) {}

    async createExperiment(
        createExperimentDto: CreateExperimentDto,
        user: User
    ): Promise<CreateExperimentDto> {

        let createdExperiment = new CreateExperimentDto(); 
        try {
            const experiment = this.experimentRepository.create(
                {
                    ...createExperimentDto,
                    createdBy: user,
                    createdById: user.id,
                    statusExperiment: StatusExperiment.CREATED,
                    createdAt: new Date()
                }
            );
            
            console.log(` Юзернейм: ${experiment.createdBy?.username}`);
            const result = await this.experimentRepository.save(experiment);
            createdExperiment = {
                name: result.name,
                faultType: result.faultType,
                params: result.params,
                duration: result.duration,
                targetAgentId: result.targetAgentId
            };
            console.log("Experiment created successfully.");
            return createdExperiment;
        } catch (error) {
            console.error(`Create experiment error: ${error}`);
            throw new InternalServerErrorException("Unable to create experiment.");
        }


    }

    async getOne(id: string, user: User): Promise<GetExperimentDto> {
        try {
            const findedExperiment = new GetExperimentDto();

            const experiment = await this.experimentRepository.findOne({
                where: { id },  // ← только ID
                relations: ['createdBy']
            });

            if (!experiment) {
                throw new NotFoundException('Experiment not found');
            }
            
            // Проверка прав ПОСЛЕ получения записи
            if (!experiment.createdBy || (experiment.createdBy.id !== user.id && user.role !== 'admin')) {
                throw new ForbiddenException('You do not have access to this experiment');
            }

            const { createdBy, ...rest } = experiment;
            Object.assign(findedExperiment, rest);
            findedExperiment.createdBy = createdBy?.username;

            return findedExperiment;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.error(`Error getting experiment: ${error}`);
            throw new InternalServerErrorException("Unable to get experiment with id: ", id);
        }
    }

    async getAll(user: User): Promise<GetExperimentDto[]> {
    try {
        let experiments: Experiment[];

        if (user.role === 'admin') {
            experiments = await this.experimentRepository.find({
                order: { createdAt: 'DESC' }
            });
            if (!experiments) {
                throw new NotFoundException('Experiments for admin not found');
            }
        } else {
            experiments = await this.experimentRepository.find({
                where: { createdBy: { id: user.id } },
                relations: ['createdBy'],
                order: { createdAt: 'DESC' }
            });
            if (!experiments) {
                throw new NotFoundException('Experiments for user not found');
            }
        }

        // Ручное преобразование каждого эксперимента в DTO
        const dtos = experiments.map(exp => {
            const dto = new GetExperimentDto();
            dto.id = exp.id;
            dto.name = exp.name;
            dto.faultType = exp.faultType;
            dto.params = exp.params;
            dto.duration = exp.duration;
            dto.targetAgentId = exp.targetAgentId;
            dto.statusExperiment = exp.statusExperiment;
            dto.createdBy = exp.createdBy?.username;
            dto.createdById = exp.createdBy?.id;
            dto.createdAt = exp.createdAt;
            dto.updatedAt = exp.updatedAt;
            return dto;
        });

        return dtos;
    } catch (error) {
        if(error instanceof NotFoundException) {
            throw error;
        }
        console.error(`Error getting experiments ${error}`);
        throw new InternalServerErrorException(`Unable to get experiments for user ${user.username}`);
    }
}

    async updateById(id: string, user: User, updateDto: UpdateExperimentDto): Promise<UpdateExperimentDto>{
        try {

            const experiment = await this.experimentRepository.findOne({
                where: { id },
                relations: ['createdBy']
            });
            let updatedExperiment = new UpdateExperimentDto();
            if(!experiment) {
                console.error(`Experiments with id: ${id} not found`);
                throw new NotFoundException(`Experiments with id: ${id} not found`);
            }
            if(experiment?.statusExperiment !== StatusExperiment.CREATED) {
                throw new ForbiddenException(`Cannot update experiment with status not created`);
            }

            // Проверка прав ПОСЛЕ получения записи
            if (!experiment.createdBy || (experiment.createdBy.id !== user.id && user.role !== 'admin')) {
                throw new ForbiddenException('You do not have access to this experiment');
            }

            Object.assign(experiment, updateDto, { updatedAt: new Date() });
            const result = await this.experimentRepository.save(experiment);
            updatedExperiment = {
                name: result.name, 
                faultType: result.faultType,
                params: result.params,
                duration: result.duration,
                targetAgentId: result.targetAgentId 
            };

            console.log(`Experiment ${id} updating successfully`);
            return updatedExperiment;

        } catch (error) {
            if(error instanceof HttpException) {
                throw error;
            }
            console.error(`Error updating experiment with id: ${id}`)
            throw new InternalServerErrorException(`Unable to update the experiment for user: ${user.username}, ${error}`);
        }

    }

    async deleteById(id: string, user: User): Promise<string>{
        try {
            const experiment = await this.getOne(id, user);
            if(!experiment) {
                console.error(`Experiments with id: ${id} not found`);
                throw new NotFoundException(`Experiments with id: ${id} not found`);
            }
            if(experiment?.statusExperiment === StatusExperiment.RUNNING) {
                throw new ForbiddenException(`Cannot delete experiment that already running!`);
            }

            await this.experimentRepository.delete(id);

            console.log(`Experiment ${id} deleting successfully`);

            return id;
        } catch (error) {
            if(error instanceof HttpException) {
                throw error;
            }
            console.error(`Error deleting experiment with id: ${id}`)
            throw new InternalServerErrorException(`Unable to delete the experiment for user: ${user.username}`);
        }
    }


    // Старт и остановку эксперимента изменим возвращаемое значение на DTO чуть позже
    async startExperiment(id: string, user: User): Promise<Experiment>{
        
        try {
            const experiment = await this.experimentRepository.findOne({
                where: { id: id }
            });
            
            if(!experiment) {
                console.error(`Experiments with id: ${id} not found`);
                throw new NotFoundException(`Experiments with id: ${id} not found`);
            }
            if (experiment?.statusExperiment === StatusExperiment.RUNNING) {
                throw new ForbiddenException(`Cannot start experiment that already running!`);
            } 

            this.rabbitmqService.sendMessage('experiment.start', experiment, user);
            experiment.statusExperiment = StatusExperiment.RUNNING;
            await this.experimentRepository.save(experiment);

            return experiment;
        } catch(error) {
            if(error instanceof HttpException) {
                throw error;
            }
            console.error(`Error starting experiment with id: ${id}`)
            throw new InternalServerErrorException(`Unable to start the experiment for user: ${user.username}`);
        }
        
    }

    async stopExperiment(id: string, user: User){
        try {
            const experiment = await this.experimentRepository.findOne({
                where: { id: id }
            });
            if(!experiment) {
                console.error(`Experiments with id: ${id} not found`);
                throw new NotFoundException(`Experiments with id: ${id} not found`);
            }
            if (experiment?.statusExperiment !== StatusExperiment.RUNNING) {
                throw new ForbiddenException(`Cannot stop experiment that already running!`);
            } 

            this.rabbitmqService.sendMessage('experiment.stop', experiment, user);
            experiment.statusExperiment = StatusExperiment.STOPPED;
            await this.experimentRepository.save(experiment);

            return experiment;
            
        } catch (error) {
            if(error instanceof HttpException) {
                throw error;
            }
            console.error(`Error starting experiment with id: ${id}`)
            throw new InternalServerErrorException(`Unable to start the experiment for user: ${user.username}`);
        }
    }


    // Метод для пометки эксперимента как завершённого по таймеру
    async markExperimentAsCompleted(experimentId: string): Promise<void> {
        try {
            const experiment = await this.experimentRepository.findOne({
                where: { id: experimentId }
            });
            if (!experiment) {
                console.error(`Experiment with id: ${experimentId} not found`);
                throw new NotFoundException(`Experiment with id: ${experimentId} not found`);
            }
            experiment.statusExperiment = StatusExperiment.FINISHED;
            await this.experimentRepository.save(experiment);
        } catch (error) {
            if(error instanceof HttpException) {
                throw error;
            }
            console.error(`Error marking experiment with id: ${experimentId} as completed`)
            throw new InternalServerErrorException(`Unable to mark the experiment as completed: ${experimentId}`);
        }
    }

}
