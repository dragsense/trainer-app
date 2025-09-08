import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAvailability } from '../entities/user-availability.entity';
import { User } from '../entities/user.entity';
import { UpdateUserAvailabilityDto } from '../dto/update-user-availability.dto';
import { CreateUserAvailabilityDto } from '../dto/create-user-availability.dto';
import { MessageResponse } from '@/interfaces/general.interface';

@Injectable()
export class UserAvailabilityService {
  constructor(
    @InjectRepository(UserAvailability)
    private readonly availabilityRepository: Repository<UserAvailability>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async findByUserId(userId: number): Promise<UserAvailability> {
    const availability = await this.availabilityRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!availability) {
      throw new NotFoundException('User availability not found');
    }

    return availability;
  }

  async findMyAvailability(currentUserId: number): Promise<UserAvailability> {
    return this.findByUserId(currentUserId);
  }

  async updateAvailability(
    userId: number,
    updateDto: UpdateUserAvailabilityDto,
    currentUserId: number,
  ): Promise<MessageResponse> {
    // Check if user is updating their own availability or is an admin
    if (userId !== currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
      });

      if (!currentUser || currentUser.level > 1) { // Not admin or super admin
        throw new ForbiddenException('You can only update your own availability');
      }
    }

    const availability = await this.findByUserId(userId);

    // Update fields
    if (updateDto.weeklySchedule) {
      availability.weeklySchedule = updateDto.weeklySchedule;
    }

    if (updateDto.unavailablePeriods) {
      availability.unavailablePeriods = updateDto.unavailablePeriods;
    }

    await this.availabilityRepository.save(availability);
    return { message: 'User Availability updated successfully' };
  }

  async createAvailability(
    userId: number,
    createDto: CreateUserAvailabilityDto,
  ): Promise<UserAvailability> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if availability already exists
    const existingAvailability = await this.availabilityRepository.findOne({
      where: { user: { id: userId } },
    });

    if (existingAvailability) {
      throw new ForbiddenException('User availability already exists');
    }

    const availability = this.availabilityRepository.create({
      user,
      weeklySchedule: createDto.weeklySchedule,
      unavailablePeriods: createDto.unavailablePeriods || [],
    });

    return this.availabilityRepository.save(availability);
  }

  async deleteAvailability(userId: number, currentUserId: number): Promise<void> {
    // Check permissions
    if (userId !== currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
      });

      if (!currentUser || currentUser.level > 1) {
        throw new ForbiddenException('You can only delete your own availability');
      }
    }

    const availability = await this.findByUserId(userId);
    await this.availabilityRepository.remove(availability);
  }

  async getAllTrainerAvailabilities(): Promise<UserAvailability[]> {
    return this.availabilityRepository.find({
      where: { user: { level: 2 } }, // Trainer level
      relations: ['user', 'user.profile'],
    });
  }

  async getAvailableTrainers(
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<UserAvailability[]> {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const allTrainers = await this.getAllTrainerAvailabilities();

    return allTrainers.filter(availability => {
      const daySchedule = availability.weeklySchedule[dayOfWeek];

      if (!daySchedule?.enabled) return false;

      // Check if the requested time slot fits within any of the trainer's time slots
      return daySchedule.timeSlots.some(slot => {
        return startTime >= slot.start && endTime <= slot.end;
      });
    });
  }

  async checkAvailability(
    userId: number,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const availability = await this.findByUserId(userId);
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const daySchedule = availability.weeklySchedule[dayOfWeek];

    if (!daySchedule?.enabled) return false;

    // Check if time slot is available
    const isWithinTimeSlots = daySchedule.timeSlots.some(slot => {
      return startTime >= slot.start && endTime <= slot.end;
    });

    if (!isWithinTimeSlots) return false;

    // Check if date is not in unavailable periods
    const isUnavailable = availability.unavailablePeriods.some(period => {
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);
      const checkDate = new Date(date);

      return checkDate >= periodStart && checkDate <= periodEnd;
    });

    return !isUnavailable;
  }

  async isUserAvailable(
    userId: number,
    dateTime: Date,
    durationMinutes: number,
  ): Promise<boolean> {

    const sessionStart = new Date(dateTime);

    const date = sessionStart.toISOString().split('T')[0]; // YYYY-MM-DD format
    const startTime = sessionStart.toTimeString().slice(0, 5); // HH:MM format

    const endDateTime = new Date(sessionStart.getTime() + durationMinutes * 60 * 1000);
    const endTime = endDateTime.toTimeString().slice(0, 5); // HH:MM format

    return this.checkAvailability(userId, date, startTime, endTime);
  }
}
