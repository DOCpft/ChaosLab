import { Controller, Get, Post, Delete, Body, HttpCode, HttpStatus, UseGuards, Param, Query, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExperimentsService } from './experiments.service';
import { CreateExperimentDto } from './dto/create-experiment-dto';
import { CurrentUser } from 'common/decorators/current-user.decorator';
import { create } from 'domain';
import { User } from 'src/users/user.entity';
import { UpdateExperimentDto } from './dto/update-experiment-dto';

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

    @Put('update')
    @HttpCode(HttpStatus.OK)
    async changeExperiment(@Query('id') id: string, @CurrentUser() user, @Body() updateDto: UpdateExperimentDto){
        return await this.experimentService.updateById(id, user, updateDto);
    }

    @Delete('delete')
    @HttpCode(HttpStatus.OK)
    async deleteExperiment(@Query('id') id: string, @CurrentUser() user){
        return await this.experimentService.deleteById(id, user);
    }

    @Post('start')
    @HttpCode(HttpStatus.OK)
    async startExperiment(@Query('id') id: string, @CurrentUser() user){
        return await this.experimentService.startExperiment(id, user);
    }
}
