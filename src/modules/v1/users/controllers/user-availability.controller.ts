import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserAvailabilityService } from '../services/user-availability.service';
import { UpdateUserAvailabilityDto } from '../dto/update-user-availability.dto';
import { CreateUserAvailabilityDto } from '../dto/create-user-availability.dto';
import { UserAvailability } from '../entities/user-availability.entity';
import { AuthUser } from '@/decorators/user.decorator';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../../auth/gaurds/jwt-auth.gaurd';

@ApiTags('User Availability')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/availability')
export class UserAvailabilityController {
  constructor(private readonly availabilityService: UserAvailabilityService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user availability' })
  @ApiResponse({
    status: 200,
    description: 'Current user availability retrieved successfully',
    type: UserAvailability,
  })
  async getMyAvailability(@AuthUser() user: User): Promise<UserAvailability> {
    return this.availabilityService.findMyAvailability(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user availability' })
  @ApiResponse({
    status: 200,
    description: 'User availability updated successfully',
    type: UserAvailability,
  })
  async updateMyAvailability(
    @AuthUser() user: User,
    @Body() updateDto: UpdateUserAvailabilityDto,
  ) {
    return this.availabilityService.updateAvailability(user.id, updateDto, user.id);
  }

  @Get('trainers')
  @ApiOperation({ summary: 'Get all trainer availabilities' })
  @ApiResponse({
    status: 200,
    description: 'Trainer availabilities retrieved successfully',
    type: [UserAvailability],
  })
  async getAllTrainerAvailabilities(): Promise<UserAvailability[]> {
    return this.availabilityService.getAllTrainerAvailabilities();
  }

  @Get('trainers/available')
  @ApiOperation({ summary: 'Get available trainers for specific time slot' })
  @ApiResponse({
    status: 200,
    description: 'Available trainers retrieved successfully',
    type: [UserAvailability],
  })
  async getAvailableTrainers(
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ): Promise<UserAvailability[]> {
    return this.availabilityService.getAvailableTrainers(date, startTime, endTime);
  }

  @Get('check/:userId')
  @ApiOperation({ summary: 'Check user availability for specific time slot' })
  @ApiResponse({
    status: 200,
    description: 'Availability check completed',
    schema: { type: 'boolean' },
  })
  async checkUserAvailability(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ): Promise<{ available: boolean }> {
    const available = await this.availabilityService.checkAvailability(
      userId,
      date,
      startTime,
      endTime,
    );
    return { available };
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user availability by ID' })
  @ApiResponse({
    status: 200,
    description: 'User availability retrieved successfully',
    type: UserAvailability,
  })
  async getUserAvailability(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserAvailability> {
    return this.availabilityService.findByUserId(userId);
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Update user availability by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User availability updated successfully',
    type: UserAvailability,
  })
  async updateUserAvailability(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateDto: UpdateUserAvailabilityDto,
    @AuthUser() currentUser: User,
  ) {
    return this.availabilityService.updateAvailability(userId, updateDto, currentUser.id);
  }

  @Post(':userId')
  @ApiOperation({ summary: 'Create user availability by ID (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'User availability created successfully',
    type: UserAvailability,
  })
  async createUserAvailability(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createDto: CreateUserAvailabilityDto,
  ): Promise<UserAvailability> {
    return this.availabilityService.createAvailability(userId, createDto);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Delete user availability by ID' })
  @ApiResponse({
    status: 200,
    description: 'User availability deleted successfully',
  })
  async deleteUserAvailability(
    @Param('userId', ParseIntPipe) userId: number,
    @AuthUser() currentUser: User,
  ): Promise<{ message: string }> {
    await this.availabilityService.deleteAvailability(userId, currentUser.id);
    return { message: 'User availability deleted successfully' };
  }
}
