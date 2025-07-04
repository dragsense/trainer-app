import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Reminder } from './entities/reminder.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { ReminderListDto } from './dto/reminder-list.dto';
import { ReminderStatus } from './enums/reminder-status.enum';
import { User } from '@/modules/v1/users/entities/user.entity';
import { PaginationResponse } from '@/interfaces/pagination-response.interface';
import { MessageResponse } from '@/interfaces/general.interface';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
  ) { }

  async create(user: Pick<User, 'id'>, createReminderDto: CreateReminderDto): Promise<MessageResponse> {
    const reminder = this.reminderRepository.create({
      ...createReminderDto,
      creator: { id: user.id },
      recipient: { id: createReminderDto.recipientId },
      session: createReminderDto.sessionId ? { id: createReminderDto.sessionId } : undefined,
      payment: createReminderDto.paymentId ? { id: createReminderDto.paymentId } : undefined,
      status: ReminderStatus.SCHEDULED,
      sentCount: 0,
      maxAttempts: createReminderDto.maxAttempts || 3,
      retryInterval: createReminderDto.retryInterval || 60, // default 60 minutes
      isRecurring: createReminderDto.isRecurring || false,
      recurringInterval: createReminderDto.recurringInterval || 7, // default 7 days
    });

    const savedReminder = await this.reminderRepository.save(reminder);
    return { message: 'Reminder created successfully' };
  }

  async findAll(user: Pick<User, 'id'>, queryDto: ReminderListDto): Promise<PaginationResponse<Reminder>> {

    const {
      page = 1,
      limit = 10,
      search,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      ...filters
    } = queryDto;

    const query = this.reminderRepository.createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.creator', 'creator')
      .leftJoinAndSelect('reminder.recipient', 'recipient')
      .leftJoinAndSelect('reminder.session', 'session')
      .leftJoinAndSelect('reminder.payment', 'payment');

    if (user) {
      query.andWhere('reminder.creator.id = :userId', { userId: user.id });
    }

    if (search) {
      query.where('reminder.name ILIKE :search', { search: `%${search}%` });
    }

    if (filters && typeof filters === 'object') {
      Object.entries(filters).forEach(([key, value]) => {
        const coercedValue = !isNaN(value as any) ? Number(value) : value;
        if (coercedValue) {
          query.andWhere(`reminder.${key} = :${key}`, { [key]: value });
        }
      });
    }

    if (createdAfter) {
      query.andWhere('reminder.createdAt >= :createdAfter', { createdAfter });
    }

    if (createdAfter) {
      query.andWhere('reminder.createdAt >= :createdAfter', { createdAfter });
    }

    if (createdBefore) {
      query.andWhere('reminder.createdAt <= :createdBefore', { createdBefore });
    }

    if (updatedAfter) {
      query.andWhere('reminder.updatedAt >= :updatedAfter', { updatedAfter });
    }

    if (updatedBefore) {
      query.andWhere('reminder.updatedAt <= :updatedBefore', { updatedBefore });
    }

    const [results, total] = await query.getManyAndCount();
    const lastPage = Math.ceil(total / limit);

    return {
      data: results,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };
  }

  async findOne(user: Pick<User, 'id'>, id: number): Promise<Reminder> {
    const reminder = await this.reminderRepository.findOne({
      where: { id, creator: { id: user.id } },
      relations: ['creator', 'recipient', 'session', 'payment'],
    });

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }


    return reminder
  }

  async update(user: Pick<User, 'id'>, id: number, updateReminderDto: UpdateReminderDto) {
    const reminder = await this.findOne(user, id);

    Object.assign(reminder, updateReminderDto);
    await this.reminderRepository.save(reminder);

    return { message: 'Reminder updated successfully' };
  }

  async remove(user: Pick<User, 'id'>, id: number): Promise<void> {
    const reminder = await this.findOne(user, id);
    await this.reminderRepository.remove(reminder);
  }

}
