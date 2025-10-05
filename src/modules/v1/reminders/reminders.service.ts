import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Reminder } from 'shared/entities';
import { CreateReminderDto } from 'shared/dtos';
import { UpdateReminderDto } from 'shared/dtos';
import { ReminderListDto } from 'shared/dtos';
import { EReminderFrequency, EReminderStatus } from 'shared/enums';
import { User } from 'shared/entities';
import { IPaginatedResponse } from 'shared/interfaces';
import { IMessageResponse } from 'shared/interfaces';
import { ReminderCreatedEvent, ReminderUpdatedEvent, ReminderDeletedEvent } from './events/reminder.events';
import { EUserLevels, EUserRole } from 'shared/enums';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async create(user: Pick<User, 'id'>, createReminderDto: CreateReminderDto): Promise<IMessageResponse> {
    // Validate frequency-specific fields

    const reminder = this.reminderRepository.create({
      ...createReminderDto,
      creator: { id: user.id },
      recipient: createReminderDto.recipient ? { id: createReminderDto.recipient.id } : undefined,
      session: createReminderDto.session ? { id: createReminderDto.session.id } : undefined,
      billing: createReminderDto.billing ? { id: createReminderDto.billing.id } : undefined,
      status: EReminderStatus.SCHEDULED,
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
        savedReminder.frequencyConfig?.frequency || EReminderFrequency.ONCE,
        savedReminder.scheduledAt
      )
    );

    return { message: 'Reminder created successfully' };
  }


  async findAll(user: User, queryDto: ReminderListDto): Promise<IPaginatedResponse<Reminder>> {
    const {
      page = 1,
      limit = 10,
      search,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      type,
      status,
      frequency,
      creatorId,
      recipientId,
      sessionId,
      paymentId,
      message,
      weekdays,
      monthDays,
      timeOfDay,
      intervalMinutes,
      priority,
        startDateAfter,
      startDateBefore,
      scheduledDateAfter,
      scheduledDateBefore,
      deliveryMethod,
      recipientEmail,
      creatorEmail,
      title,
      ...otherFilters
    } = queryDto;

    const query = this.reminderRepository.createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.creator', 'creator')
      .leftJoinAndSelect('creator.profile', 'creatorProfile')
      .leftJoin('reminder.recipient', 'recipient')
      .addSelect(['recipient.id', 'recipient.email'])
      .leftJoinAndSelect('recipient.profile', 'recipientProfile')
      .leftJoin('reminder.session', 'session')
      .addSelect(['session.id', 'session.title'])
      .leftJoin('reminder.billing', 'billing')
      .addSelect(['billing.id', 'billing.localInvoiceNumber'])

    if (user && user.level !== EUserLevels[EUserRole.SUPER_ADMIN]) {
      query.andWhere('reminder.creator.id = :userId', { userId: user.id });
    }

    // Search functionality
    if (search) {
      query.andWhere(
        `(reminder.message ILIKE :search OR 
         reminder.title ILIKE :search OR
         creator.email ILIKE :search OR
         recipient.email ILIKE :search OR
         creatorProfile.firstName ILIKE :search OR
         creatorProfile.lastName ILIKE :search OR
         recipientProfile.firstName ILIKE :search OR
         recipientProfile.lastName ILIKE :search)`,
        { search: `%${search}%` }
      );
    }

    // Specific filters
    if (type) {
      query.andWhere('reminder.type = :type', { type });
    }

    if (status) {
      query.andWhere('reminder.status = :status', { status });
    }

    if (frequency) {
      query.andWhere('reminder.frequencyConfig->\'frequency\' = :frequency', { frequency });
    }

    if (creatorId) {
      query.andWhere('reminder.creatorId = :creatorId', { creatorId });
    }

    if (recipientId) {
      query.andWhere('reminder.recipientId = :recipientId', { recipientId });
    }

    if (sessionId) {
      query.andWhere('reminder.sessionId = :sessionId', { sessionId });
    }

    if (paymentId) {
      query.andWhere('reminder.billingId = :paymentId', { paymentId });
    }

    if (message) {
      query.andWhere('reminder.message ILIKE :message', { message: `%${message}%` });
    }

    if (title) {
      query.andWhere('reminder.title ILIKE :title', { title: `%${title}%` });
    }

    if (weekdays && weekdays.length > 0) {
      query.andWhere('reminder.frequencyConfig->\'weekdays\' ?| array[:weekdays]', { 
        weekdays: weekdays.map(d => d.toString()) 
      });
    }

    if (monthDays && monthDays.length > 0) {
      query.andWhere('reminder.frequencyConfig->\'monthDays\' ?| array[:monthDays]', { 
        monthDays: monthDays.map(d => d.toString()) 
      });
    }

    if (timeOfDay) {
      query.andWhere('reminder.frequencyConfig->\'timeOfDay\' = :timeOfDay', { timeOfDay });
    }

    if (intervalMinutes) {
      query.andWhere('reminder.frequencyConfig->\'intervalMinutes\' = :intervalMinutes', { 
        intervalMinutes: intervalMinutes.toString() 
      });
    }

    if (priority !== undefined) {
      query.andWhere('reminder.priority = :priority', { priority });
    }

    if (startDateAfter) {
      query.andWhere('reminder.startDate >= :startDateAfter', { startDateAfter });
    }

    if (startDateBefore) {
      query.andWhere('reminder.startDate <= :startDateBefore', { startDateBefore });
    }

      if (scheduledDateAfter) {
      query.andWhere('reminder.scheduledAt >= :scheduledDateAfter', { scheduledDateAfter });
    }

    if (scheduledDateBefore) {
      query.andWhere('reminder.scheduledAt <= :scheduledDateBefore', { scheduledDateBefore });
    }

    if (deliveryMethod) {
      query.andWhere('reminder.deliveryMethods @> :deliveryMethod', { 
        deliveryMethod: JSON.stringify([deliveryMethod])
      });
    }

    if (recipientEmail) {
      query.andWhere('recipient.email ILIKE :recipientEmail', { 
        recipientEmail: `%${recipientEmail}%` 
      });
    }

    if (creatorEmail) {
      query.andWhere('creator.email ILIKE :creatorEmail', { 
        creatorEmail: `%${creatorEmail}%` 
      });
    }

    // Handle any other filters
    if (otherFilters && typeof otherFilters === 'object') {
      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value && value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query.andWhere(`reminder.${key} && ARRAY[:...${key}]`, { [key]: value });
          } else {
            const coercedValue = !isNaN(value as any) ? Number(value) : value;
            query.andWhere(`reminder.${key} = :${key}`, { [key]: coercedValue });
          }
        }
      });
    }

    // Date range filters
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
    const reminder = await this.reminderRepository
      .createQueryBuilder('reminder')
      .leftJoin('reminder.creator', 'creator')
      .addSelect(['creator.id', 'creator.email'])
      .leftJoin('reminder.recipient', 'recipient')
      .addSelect(['recipient.id', 'recipient.email'])
      .leftJoin('reminder.session', 'session')
      .addSelect(['session.id', 'session.title'])
      .leftJoin('reminder.billing', 'billing')
      .addSelect(['billing.id', 'billing.localInvoiceNumber'])
      .where('reminder.id = :id', { id })
      .getOne();

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    return reminder;
  }

  async update(user: Pick<User, 'id'>, id: number, updateReminderDto: UpdateReminderDto) {
    const reminder = await this.findOne(user, id);
    const oldStartAt = reminder.scheduledAt;


    Object.assign(reminder, updateReminderDto);
    const updatedReminder = await this.reminderRepository.save(reminder);

    // Emit reminder updated event
    this.eventEmitter.emit(
      'reminder.updated',
      new ReminderUpdatedEvent(
        updatedReminder.id,
        updatedReminder.frequencyConfig?.frequency || EReminderFrequency.ONCE,
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
