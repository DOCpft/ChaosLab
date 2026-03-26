import { Module } from '@nestjs/common';
import { ExperimentsService } from './experiments.service';
import { ExperimentsController } from './experiments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Experiment } from './experiment.entity';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Experiment]),
    RabbitmqModule
  ],
  providers: [ExperimentsService],
  controllers: [ExperimentsController]
})
export class ExperimentsModule {}
