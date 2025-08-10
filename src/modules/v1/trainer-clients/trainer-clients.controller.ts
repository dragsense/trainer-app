import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Query, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { TrainerClientsService } from './trainer-clients.service';
import { CreateTrainerClientDto } from './dto/create-trainer-client.dto';
import { TrainerClientListDto } from './dto/trainer-client-list.dto';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';
import { RoleLevelGuard } from '@/guards/level.guard';
import { MinRoleLevel } from '@/decorators/level.decorator';
import { UserLevels, UserRole } from '../users/enums/user.enum';

@UseGuards(JwtAuthGuard, RoleLevelGuard)
@MinRoleLevel(UserLevels[UserRole.SUPER_ADMIN])
@ApiTags('Trainer-Clients')
@Controller('trainer-clients')
export class TrainerClientsController {
  constructor(private readonly trainerClientsService: TrainerClientsService) { }

  @Post()
  @ApiOperation({ summary: 'Assign trainer to client' })
  @ApiResponse({ status: 201, description: 'Trainer assigned to client successfully' })
  @ApiResponse({ status: 409, description: 'Client is already assigned to this trainer' })
  @ApiBody({ type: CreateTrainerClientDto, description: 'Details of the trainer-client assignment' })
  assignTrainerToClient(@Body() createTrainerClientDto: CreateTrainerClientDto) {
    return this.trainerClientsService.assignTrainerToClient(createTrainerClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainer-client assignments' })
  @ApiResponse({ status: 200, description: 'List of trainer-client assignments', type: [CreateTrainerClientDto] })
  @ApiResponse({ status: 404, description: 'No assignments found' })
  findAll(@Query() queryDto: TrainerClientListDto) {
    return this.trainerClientsService.findAll(queryDto);
  }



  @Get(':id')
  @ApiOperation({ summary: 'Get trainer-client assignment by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the trainer-client assignment' })
  @ApiResponse({ status: 200, description: 'Trainer-client assignment found', type: CreateTrainerClientDto })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trainerClientsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove assignment by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the trainer-client assignment to remove' })
  @ApiResponse({ status: 200, description: 'Assignment removed successfully' })
  @HttpCode(204)
  removeAssignment(@Param('id', ParseIntPipe) id: number) {
    return this.trainerClientsService.removeAssignment(id);
  }

  @Delete('trainer/:trainerId/client/:clientId')
  @ApiOperation({ summary: 'Remove trainer from client' })
  @ApiParam({ name: 'trainerId', type: Number, description: 'ID of the trainer' })
  @ApiParam({ name: 'clientId', type: Number, description: 'ID of the client' })
  @ApiResponse({ status: 200, description: 'Trainer removed from client successfully' })
  removeTrainerFromClient(
    @Param('trainerId', ParseIntPipe) trainerId: number,
    @Param('clientId', ParseIntPipe) clientId: number
  ) {
    return this.trainerClientsService.removeTrainerFromClient(trainerId, clientId);
  }
}
