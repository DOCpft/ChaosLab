import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experiment, FaultType, StatusExperiment } from './experiment.entity';
import { CreateExperimentDto } from './dto/create-experiment-dto';
import { User } from 'src/users/user.entity';

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

            return await this.experimentRepository.save(experiment);
        } catch (error) {
            console.error(`Create experiment error: ${error}`);
            throw new InternalServerErrorException("Unable to create experiment.");
        }


    }

    async getOne(id: string, user: User): Promise<Experiment | null> {
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

    async getAll(user: User): Promise<Experiment[] | null> {
        try {
            if(user.role === 'admin'){ // все если админ
                return this.experimentRepository.find({ order: { createdAt: 'DESC' } });
            }
            return this.experimentRepository.find({ 
                where: { createdBy: user },
                order: { createdAt: 'DESC' }
             });
        } catch (error) {
            console.error(`Error getting experiments ${error}`);
            throw new InternalServerErrorException(`Unable to get experiments for user ${user.username}`);
        }
    }

}
