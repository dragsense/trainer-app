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
  Req,
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
import { CreateSessionDto } from './dtos/create-session.dto';
import { UpdateSessionDto } from './dtos/update-session.dto';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';
import { RoleLevelGuard } from '@/guards/level.guard';
import { UserRole } from '@/common/enums/role.enum';
import { MinRoleLevel } from '@/decorators/level.decorator';
import { UserLevels } from '../users/enums/user.enum';
import { SessionListDto } from './dtos/session-list.dto';
import { MessageResponseDto } from '@/shared-dto/general.dto';
import { MessageResponse } from '@/interfaces/general.interface';
import { SessionPaginatedDto } from './dtos/session-response.dto';
import { Session } from './entities/session.entity';

@UseGuards(JwtAuthGuard, RoleLevelGuard)
@ApiBearerAuth('access-token')
@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) { }

  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({
    status: 201,
    description: 'The session has been successfully created.',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Trainer role required' })
  @Post()
  @MinRoleLevel(UserLevels[UserRole.TRAINER])
  async create(
    @Body() createSessionDto: CreateSessionDto,
    @AuthUser() user: any,
  ): Promise<MessageResponse> {
    return this.sessionsService.create(user, createSessionDto);
  }

  @ApiOperation({ summary: 'Get all sessions' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved sessions.',
    type: SessionPaginatedDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @Get()
  @MinRoleLevel(UserLevels[UserRole.ADMIN])
  async findAll(@Query() query: SessionListDto) {
    return this.sessionsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a session by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved session.',
    type: Session,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get(':id')
  @MinRoleLevel(UserLevels[UserRole.CLIENT])
  async findOne(@Param('id', ParseIntPipe) id: number, @AuthUser() user: any) {
    return this.sessionsService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Update a session' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated session.',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Trainer role required' })
  @Patch(':id')
  @MinRoleLevel(UserLevels[UserRole.TRAINER])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSessionDto: UpdateSessionDto,
    @AuthUser() user: any,
  ) {
    return this.sessionsService.update(id, updateSessionDto, user);
  }

  @ApiOperation({ summary: 'Delete a session' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted session.',
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @Delete(':id')
  @MinRoleLevel(UserLevels[UserRole.ADMIN])
  async remove(@Param('id', ParseIntPipe) id: number, @AuthUser() user: any) {
    return this.sessionsService.remove(id, user);
  }
}
