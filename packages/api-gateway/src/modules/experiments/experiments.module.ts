import { forwardRef, Module } from '@nestjs/common';
import { ExperimentsService } from './experiments.service';
import { ExperimentsController } from './experiments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Experiment } from '../../database/experiment.entity';
import { RabbitmqModule } from 'src/modules/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Experiment]),
    forwardRef(() => RabbitmqModule)
  ],
  providers: [ExperimentsService],
  controllers: [ExperimentsController],
  exports: [ExperimentsService]
})
export class ExperimentsModule {}
