import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { Experiment, FaultType, StatusExperiment } from './experiment.entity';
import { CreateExperimentDto } from './dto/create-experiment-dto';
import { User } from 'src/users/user.entity';
import { UpdateExperimentDto } from './dto/update-experiment-dto';
import { UpdateResult } from 'typeorm/browser';

@Injectable()
export class ExperimentsService {
    constructor(
        @InjectRepository(Experiment)
        private readonly experimentRepository: Repository<Experiment>
    ) {}

    async createExperiment(
        createExperimentDto: CreateExperimentDto,
        user: User
    ): Promise<Experiment | null> {
        
        try {
            const experiment = await this.experimentRepository.create(
                {
                    ...createExperimentDto,
                    createdBy: user,
                    createdById: user.id,
                    statusExperiment: StatusExperiment.CREATED,
                    createdAt: new Date()
                }
            );
            console.log("Experiment created successfully.");
            return await this.experimentRepository.save(experiment);
        } catch (error) {
            console.error(`Create experiment error: ${error}`);
            throw new InternalServerErrorException("Unable to create experiment.");
        }


    }

    async getOne(id: string, user: User): Promise<Experiment> {
        try {
            const experiment = await this.experimentRepository.findOne({
                where: {id, createdById: user.id},
                relations: ['createdBy']
            });

            if (!experiment) {
                throw new NotFoundException('Experiment not found');
            }
            if (experiment.createdBy.id !== user.id && user.role !== 'admin') {
                throw new ForbiddenException('You do not have access to this experiment');
            }
            return experiment;
        } catch (error) {
            console.error(`Error getting experiment: ${error}`);
            throw new InternalServerErrorException("Unable to get experiment with id: ", id);
        }
    }

    async getAll(user: User): Promise<Experiment[]> {
        try {
            if(user.role === 'admin'){ // все если админ
                console.log(`Getting experiments for admin: ${user.username} has been successfully`);
                return this.experimentRepository.find({ order: { createdAt: 'DESC' } });
            }
            console.log(`Getting experiments for user: ${user.username} has been successfully`);
            return this.experimentRepository.find({ 
                where: { createdBy: user },
                order: { createdAt: 'DESC' }
             });
        } catch (error) {
            console.error(`Error getting experiments ${error}`);
            throw new InternalServerErrorException(`Unable to get experiments for user ${user.username}`);
        }
    }

    async updateById(id: string, user: User, updateDto: UpdateExperimentDto): Promise<Experiment>{
        try {
            const experiment = await this.getOne(id, user);
            if(!experiment) {
                console.error(`Experiments with id: ${id} not found`);
                throw new NotFoundException(`Experiments with id: ${id} not found`);
            }
            if(experiment?.statusExperiment !== StatusExperiment.CREATED) {
                throw new ForbiddenException(`Cannot update experiment with status not created`);
            }

            Object.assign(experiment, updateDto, { updatedAt: new Date() });
            const updatedExperiment = await this.experimentRepository.save(experiment);
            

            console.log(`Experiment ${id} updating successfully`);
            return updatedExperiment;

        } catch (error) {
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
            console.error(`Error deleting experiment with id: ${id}`)
            throw new InternalServerErrorException(`Unable to delete the experiment for user: ${user.username}`);
        }
    }

    async startExperiment(id: string, user: User): Promise<Experiment>{
        try {
            const experiment = await this.getOne(id, user);
            if(!experiment) {
                console.error(`Experiments with id: ${id} not found`);
                throw new NotFoundException(`Experiments with id: ${id} not found`);
            }
            if (![StatusExperiment.CREATED, StatusExperiment.FAILED].includes(experiment?.statusExperiment)) {
                throw new ForbiddenException(`Cannot delete experiment that already running!`);
            } 

            // Тут будем тправлять в очередь RabbitMQ

            experiment.statusExperiment = StatusExperiment.CREATED;
            await this.experimentRepository.save(experiment);

            return experiment;
            
        } catch (error) {
            console.error(`Error starting experiment with id: ${id}`)
            throw new InternalServerErrorException(`Unable to start the experiment for user: ${user.username}`);
        }
    }

}
