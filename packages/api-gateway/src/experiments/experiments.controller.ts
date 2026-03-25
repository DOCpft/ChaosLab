import { Controller, Get, Post, Delete, Body, HttpCode, HttpStatus, UseGuards, Param, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExperimentsService } from './experiments.service';
import { CreateExperimentDto } from './dto/create-experiment-dto';
import { CurrentUser } from 'common/decorators/current-user.decorator';
import { create } from 'domain';
import { User } from 'src/users/user.entity';

@Controller('experiments')
@UseGuards(AuthGuard('jwt'))
export class ExperimentsController {
    constructor(private readonly experimentService: ExperimentsService) {}
    @Post('create')
    @HttpCode(HttpStatus.OK)
    async createExperiment(@Body() createDto: CreateExperimentDto, @CurrentUser() user) {
        return await this.experimentService.createExperiment(createDto, user);
    }

    @Get('get')
    @HttpCode(HttpStatus.OK)
    async getAllExp(@CurrentUser() user){
        return await this.experimentService.getAll(user);
    }

    @Get('get')
    @HttpCode(HttpStatus.OK)
    async getOneExp(@Query('id') id: string, @CurrentUser() user){
        return await this.experimentService.getOne(id, user);
    }
}
