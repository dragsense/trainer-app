import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthUser } from '@/decorators/user.decorator';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from 'shared/dtos';
import { UpdateSessionDto } from 'shared/dtos';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';
import { RoleLevelGuard } from '@/guards/level.guard';
import { MinRoleLevel } from '@/decorators/level.decorator';
import { EUserLevels, EUserRole } from 'shared/enums';
import { SessionListDto } from 'shared/dtos';
import { MessageResponseDto } from 'shared/dtos';
import { IMessageResponse } from 'shared/interfaces';
import { SessionPaginatedDto } from 'shared/dtos';
import { Session, User } from 'shared/entities';
import { IPaginatedResponse } from 'shared/interfaces';
  import { ESessionStatus } from 'shared/enums';

@UseGuards(JwtAuthGuard, RoleLevelGuard)
@ApiBearerAuth('access-token')
@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @MinRoleLevel(EUserLevels[EUserRole.TRAINER])
  @Post()
  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({
    status: 201,
    description: 'Session created successfully',
    type: Session
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role level' })
  async create(
    @AuthUser() user: User,
    @Body() createSessionDto: CreateSessionDto
  ) {
    return this.sessionsService.create(user, createSessionDto);
  }


  @MinRoleLevel(EUserLevels[EUserRole.USER])
  @Get()
  @ApiOperation({ summary: 'Get all sessions with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'List of sessions',
    type: SessionPaginatedDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role level' })
  async findAll(
    @Query() queryDto: SessionListDto,
    @AuthUser() user: User
  ): Promise<IPaginatedResponse<Session>> {
    return this.sessionsService.findAll(queryDto, user);
  }

  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific session' })
  @ApiResponse({
    status: 200,
    description: 'Session details',
    type: Session
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role level' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: User
  ): Promise<Session> {
    return this.sessionsService.findOne(id, user);
  }

  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Patch(':id')
  @ApiOperation({ summary: 'Update a session' })
  @ApiResponse({
    status: 200,
    description: 'Session updated successfully',
    type: Session
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role level' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSessionDto: UpdateSessionDto,
    @AuthUser() user: User
  ): Promise<Session> {
    return this.sessionsService.update(id, updateSessionDto, user);
  }

  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update session status' })
  @ApiResponse({
    status: 200,
    description: 'Session status updated successfully',
    type: Session
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role level' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: ESessionStatus,
    @AuthUser() user: User
  ): Promise<Session> {
    return this.sessionsService.updateStatus(id, status, user);
  }

  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Delete(':id')
  @ApiOperation({ summary: 'Cancel/delete a session' })
  @ApiResponse({
    status: 200,
    description: 'Session cancelled successfully',
    type: MessageResponseDto
  })
  @ApiResponse({ status: 400, description: 'Cannot cancel this session' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role level' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: User
  ): Promise<IMessageResponse> {
    return this.sessionsService.remove(id, user);
  }
}
