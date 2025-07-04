import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { ReminderListDto } from './dto/reminder-list.dto';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';
import { RoleLevelGuard } from '@/guards/level.guard';
import { MinRoleLevel } from '@/decorators/level.decorator';
import { UserLevels, UserRole } from '../users/enums/user.enum';
import { AuthUser } from '@/decorators/user.decorator';

@UseGuards(JwtAuthGuard, RoleLevelGuard)
@ApiTags('Reminders')
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiResponse({ status: 201, description: 'Reminder created successfully' })
  @Post()
  create(
    @AuthUser() user: any,
    @Body() createReminderDto: CreateReminderDto,
  ) {
    return this.remindersService.create(user, createReminderDto);
  }

  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Get all reminders' })
  @ApiResponse({ status: 200, description: 'Reminders retrieved successfully' })
  @Get()
  findAll(
    @AuthUser() user: any,
    @Query() query: ReminderListDto,
  ) {
    return this.remindersService.findAll(user, query);
  }

  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Get a specific reminder' })
  @ApiResponse({ status: 200, description: 'Reminder retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @Get(':id')
  findOne(
    @AuthUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.remindersService.findOne(user, id);
  }



  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Update a reminder' })
  @ApiResponse({ status: 200, description: 'Reminder updated successfully' })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @Patch(':id')
  update(
    @AuthUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    return this.remindersService.update(user, id, updateReminderDto);
  }

  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Delete a reminder' })
  @ApiResponse({ status: 200, description: 'Reminder deleted successfully' })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @Delete(':id')
  remove(
    @AuthUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.remindersService.remove(user, id);
  }


}
