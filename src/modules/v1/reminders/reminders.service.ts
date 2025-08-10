import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Reminder } from './entities/reminder.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { ReminderListDto } from './dto/reminder-list.dto';
import { ReminderFrequency, ReminderStatus} from './enums/reminder.enum';
import { User } from '@/modules/v1/users/entities/user.entity';
import { PaginationResponse } from '@/interfaces/pagination-response.interface';
import { MessageResponse } from '@/interfaces/general.interface';
import { ReminderCreatedEvent, ReminderUpdatedEvent, ReminderDeletedEvent } from './events/reminder.events';
import { UserLevels, UserRole } from '../users/enums/user.enum';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async create(user: Pick<User, 'id'>, createReminderDto: CreateReminderDto): Promise<MessageResponse> {
    // Validate frequency-specific fields
    this.validateFrequencyFields(createReminderDto);

    const reminder = this.reminderRepository.create({
      ...createReminderDto,
      creator: { id: user.id },
      recipient: createReminderDto.recipientId ? { id: createReminderDto.recipientId }: undefined,
      session: createReminderDto.sessionId ? { id: createReminderDto.sessionId } : undefined,
      billing: createReminderDto.billingId ? { id: createReminderDto.billingId } : undefined,
      status: ReminderStatus.SCHEDULED,
      sentCount: 0,
      maxAttempts: createReminderDto.maxAttempts || 3,
      retryInterval: createReminderDto.retryInterval || 60 // default 60 minutes
    });

    const savedReminder = await this.reminderRepository.save(reminder);
    
    // Emit reminder created event
    this.eventEmitter.emit(
      'reminder.created',
      new ReminderCreatedEvent(
        savedReminder.id,
        savedReminder.frequency,
        savedReminder.scheduledAt
      )
    );

    return { message: 'Reminder created successfully' };
  }

  private validateFrequencyFields(dto: CreateReminderDto | UpdateReminderDto): void {
    switch (dto.frequency) {
      case ReminderFrequency.MINUTELY:
      case ReminderFrequency.HOURLY:
        if (!dto.intervalMinutes) {
          throw new BadRequestException('intervalMinutes is required for MINUTELY/HOURLY frequency');
        }
        break;

      case ReminderFrequency.DAILY:
        if (!dto.timeOfDay) {
          throw new BadRequestException('timeOfDay is required for DAILY frequency');
        }
        break;

      case ReminderFrequency.WEEKLY:
        if (!dto.weekdays?.length || !dto.timeOfDay) {
          throw new BadRequestException('weekdays and timeOfDay are required for WEEKLY frequency');
        }
        if (dto.weekdays.some(day => day < 0 || day > 6)) {
          throw new BadRequestException('weekdays must be between 0 (Sunday) and 6 (Saturday)');
        }
        break;

      case ReminderFrequency.MONTHLY:
        if (!dto.monthDays?.length || !dto.timeOfDay) {
          throw new BadRequestException('monthDays and timeOfDay are required for MONTHLY frequency');
        }
        if (dto.monthDays.some(day => day < 1 || day > 31)) {
          throw new BadRequestException('monthDays must be between 1 and 31');
        }
        break;
    }
  }

  async findAll(user: User, queryDto: ReminderListDto): Promise<PaginationResponse<Reminder>> {
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

    if (user && user.level !== UserLevels[UserRole.SUPER_ADMIN]) {
      query.andWhere('reminder.creator.id = :userId', { userId: user.id });
    }

    if (search) {
      query.andWhere('(reminder.message ILIKE :search)', { search: `%${search}%` });
    }

    if (filters && typeof filters === 'object') {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query.andWhere(`reminder.${key} && ARRAY[:...${key}]`, { [key]: value });
          } else {
            const coercedValue = !isNaN(value as any) ? Number(value) : value;
            query.andWhere(`reminder.${key} = :${key}`, { [key]: coercedValue });
          }
        }
      });
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

    query
      .orderBy('reminder.scheduledAt', 'ASC')
      .addOrderBy('reminder.priority', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

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
      relations: ['creator', 'recipient', 'session'],
    });

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    return reminder;
  }

  async update(user: Pick<User, 'id'>, id: number, updateReminderDto: UpdateReminderDto) {
    const reminder = await this.findOne(user, id);
    const oldStartAt = reminder.scheduledAt;

    // If frequency is being updated, validate the new frequency fields
    if (updateReminderDto.frequency) {
      this.validateFrequencyFields({
        ...reminder,
        ...updateReminderDto
      });
    }

    Object.assign(reminder, updateReminderDto);
    const updatedReminder = await this.reminderRepository.save(reminder);

    // Emit reminder updated event
    this.eventEmitter.emit(
      'reminder.updated',
      new ReminderUpdatedEvent(
        updatedReminder.id,
        updatedReminder.frequency,
        updatedReminder.scheduledAt,
        oldStartAt
      )
    );

    return { message: 'Reminder updated successfully' };
  }

  async remove(user: Pick<User, 'id'>, id: number): Promise<void> {
    const reminder = await this.findOne(user, id);
    await this.reminderRepository.remove(reminder);

    // Emit reminder deleted event
    this.eventEmitter.emit(
      'reminder.deleted',
      new ReminderDeletedEvent(id)
    );
  }
}
