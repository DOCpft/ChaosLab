import { Controller, Get, Post, Delete, Body, HttpCode, HttpStatus, UseGuards, Param, Query, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExperimentsService } from './experiments.service';
import { CreateExperimentDto } from './dto/create-experiment-dto';
import { CurrentUser } from 'common/decorators/current-user.decorator';
import { UpdateExperimentDto } from './dto/update-experiment-dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

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
    @ApiResponse({ status: 200, description: "Эксперимент создан"  })
    @ApiResponse({ status: 401, description: "Не авторизован"  })
    async createExperiment(@Body() createDto: CreateExperimentDto, @CurrentUser() user) {
        return await this.experimentService.createExperiment(createDto, user);
    }

    @Get('get')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Получить список экспериментов' })
    @ApiResponse({ status: 200, description: "Эксперименты получены"  })
    @ApiResponse({ status: 401, description: "Не авторизован"  })
    async getAllExp(@CurrentUser() user){
        return await this.experimentService.getAll(user);
    }

    @Get('get/exp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Получить список всех экспериментов пользователя (или все если админ)" })
    @ApiResponse({ status: 200, description: "Эксперимент получен"  })
    @ApiResponse({ status: 401, description: "Не авторизован"  })
    @ApiQuery({ name: 'id', description: 'UUID эксперимента' })
    async getOneExp(@Query('id') id: string, @CurrentUser() user){
        return await this.experimentService.getOne(id, user);
    }

    @Put('update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Изменить параметры эксперимента" })
    @ApiResponse({ status: 200, description: "Эксперимент обновлен"  })
    @ApiResponse({ status: 401, description: "Не авторизован"  })
    @ApiQuery({ name: 'id', description: 'UUID эксперимента' })
    async changeExperiment(@Query('id') id: string, @CurrentUser() user, @Body() updateDto: UpdateExperimentDto){
        return await this.experimentService.updateById(id, user, updateDto);
    }

    @Delete('delete')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Удалить эксперимент" })
    @ApiResponse({ status: 200, description: "Эксперимент удален"  })
    @ApiResponse({ status: 401, description: "Не авторизован"  })
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
