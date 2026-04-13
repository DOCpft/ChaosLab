import { Controller, Get, Post, Delete, Body, HttpCode, HttpStatus, UseGuards, Param, Query, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExperimentsService } from './experiments.service';
import { CreateExperimentDto } from './dto/requests/create-experiment-dto';
import { CurrentUser } from 'common/decorators/current-user.decorator';
import { UpdateExperimentDto } from './dto/requests/update-experiment-dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateExperimentResponseDto } from './dto/responses/create-experiment-response.dto';
import { UpdateExperimentResponseDto } from './dto/responses/update-experiment-response.dto';
import { GetExperimentsResponseDto } from './dto/responses/get-experiments-response.dto';

@ApiTags('experiments')
@Controller('experiments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ExperimentsController {
    constructor(private readonly experimentService: ExperimentsService) {}
    @Post('create')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Создать эксперимент" })
    @ApiBody({ type: CreateExperimentDto })
    @ApiResponse({ status: 200, description: "Эксперимент создан", type: CreateExperimentResponseDto  })
    @ApiResponse({ status: 401, description: "Не авторизован"  })
    async createExperiment(@Body() createDto: CreateExperimentDto, @CurrentUser() user): Promise<CreateExperimentResponseDto> {
        const experiment = await this.experimentService.createExperiment(createDto, user);
        let result = new CreateExperimentResponseDto();
        if(!experiment){
            result = { statusCode: HttpStatus.BAD_GATEWAY, message: "Unable to create experiment" }
            return result
        }

        result = { statusCode: HttpStatus.OK, message: "Created experiment is successfully", data: experiment };
        return result;
    }

    @Get('get')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Получить список экспериментов' })
    @ApiResponse({ status: 200, description: "Эксперименты получены", type: GetExperimentsResponseDto })
    @ApiResponse({ status: 401, description: "Не авторизован"  })
    @ApiResponse({ status: 404, description: "Эксперимент не найден" })
    async getAllExp(@CurrentUser() user): Promise<GetExperimentsResponseDto>{
        const experiments = await this.experimentService.getAll(user);
        let result = new GetExperimentsResponseDto();
        if(!experiments) {
            result = { statusCode: HttpStatus.NOT_FOUND, message: "Not found experiments" };
            return result;
        }

        result = { statusCode: HttpStatus.OK, message: "Experiments founded successfully", data: experiments };
        return result;
    }

    @Get('get/exp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Получить список всех экспериментов пользователя (или все если админ)" })
    @ApiResponse({ status: 200, description: "Эксперимент получен", type: GetExperimentsResponseDto  })
    @ApiResponse({ status: 401, description: "Не авторизован"  })
    @ApiResponse({ status: 404, description: "Эксперимент не найден" })
    @ApiQuery({ name: 'id', description: 'UUID эксперимента' })
    async getOneExp(@Query('id') id: string, @CurrentUser() user): Promise<GetExperimentsResponseDto>{
        const experiment = await this.experimentService.getOne(id, user);
        let result = new GetExperimentsResponseDto(); 

        result = { statusCode: HttpStatus.OK, message: "Experiment gets successfully", data: experiment };
        return result;
    }

    @Put('update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Изменить параметры эксперимента" })
    @ApiResponse({ status: 200, description: "Эксперимент обновлен", type: UpdateExperimentResponseDto })
    @ApiResponse({ status: 401, description: "Не авторизован"  })
    @ApiResponse({ status: 404, description: "Эксперимент не найден" })
    @ApiQuery({ name: 'id', description: 'UUID эксперимента' })
    async changeExperiment(@Query('id') id: string,
                           @CurrentUser() user,
                           @Body() updateDto: UpdateExperimentDto): Promise<UpdateExperimentResponseDto>{
        //return await this.experimentService.updateById(id, user, updateDto);

        const experiment = await this.experimentService.updateById(id, user, updateDto);
        let result = new UpdateExperimentResponseDto();
        result = { statusCode: HttpStatus.OK, message: "Created experiment is successfully", data: experiment };
        return result;
    }

    @Delete('delete')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Удалить эксперимент" })
    @ApiResponse({ status: 200, description: "Эксперимент удален"  })
    @ApiResponse({ status: 401, description: "Не авторизован"  })
    @ApiResponse({ status: 404, description: "Эксперимент не найден" })
    @ApiQuery({ name: 'id', description: 'UUID эксперимента' })
    async deleteExperiment(@Query('id') id: string, @CurrentUser() user){
        return await this.experimentService.deleteById(id, user);
    }

    @Post('start')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Начать эксперимент" })
    @ApiResponse({ status: 200, description: "Эксперимент начат"  })
    @ApiResponse({ status: 401, description: "Не авторизован"  })
    @ApiQuery({ name: 'id', description: 'UUID эксперимента' })
    async startExperiment(@Query('id') id: string, @CurrentUser() user){
        return await this.experimentService.startExperiment(id, user);
    }

    @Post('stop')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Остановить эксперимент" })
    @ApiResponse({ status: 200, description: "Эксперимент остановлен"  })
    @ApiResponse({ status: 401, description: "Не авторизован"  })
    @ApiQuery({ name: 'id', description: 'UUID эксперимента' })
    async stopExperiment(@Query('id') id: string, @CurrentUser() user){
        return await this.experimentService.stopExperiment(id, user);
    }
}
