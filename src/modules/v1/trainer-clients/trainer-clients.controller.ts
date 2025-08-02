import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TrainerClientsService } from './trainer-clients.service';
import { CreateTrainerClientDto } from './dto/create-trainer-client.dto';

@ApiTags('Trainer-Clients')
@Controller('trainer-clients')
export class TrainerClientsController {
  constructor(private readonly trainerClientsService: TrainerClientsService) {}

  @Post('assign')
  @ApiOperation({ summary: 'Assign trainer to client' })
  assignTrainerToClient(@Body() createTrainerClientDto: CreateTrainerClientDto) {
    return this.trainerClientsService.assignTrainerToClient(createTrainerClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainer-client assignments' })
  findAll() {
    return this.trainerClientsService.findAll();
  }

  @Get('trainer/:trainerId/clients')
  @ApiOperation({ summary: 'Get all clients for a trainer' })
  getTrainerClients(@Param('trainerId') trainerId: string) {
    return this.trainerClientsService.getTrainerClients(+trainerId);
  }

  @Get('client/:clientId/trainers')
  @ApiOperation({ summary: 'Get all trainers for a client' })
  getClientTrainers(@Param('clientId') clientId: string) {
    return this.trainerClientsService.getClientTrainers(+clientId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove assignment by ID' })
  removeAssignment(@Param('id') id: string) {
    return this.trainerClientsService.removeAssignment(+id);
  }

  @Delete('trainer/:trainerId/client/:clientId')
  @ApiOperation({ summary: 'Remove trainer from client' })
  removeTrainerFromClient(
    @Param('trainerId') trainerId: string,
    @Param('clientId') clientId: string
  ) {
    return this.trainerClientsService.removeTrainerFromClient(+trainerId, +clientId);
  }
}
