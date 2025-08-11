import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionListDto } from './dto/session-list.dto';
import { UsersService } from '../users/users.service';
import { UserAvailabilityService } from '../users/services/user-availability.service';
import { MessageResponse } from '@/interfaces/general.interface';
import { PaginationResponse } from '@/interfaces/pagination-response.interface';
import { User } from '../users/entities/user.entity';
import { SessionStatus } from './enums/session.enum';
import { UserRole, UserLevels } from '../users/enums/user.enum';
import { StripeConnectService } from '../settings/stripe-connect/stripe-connect.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    private readonly usersService: UsersService,
    private readonly userAvailabilityService: UserAvailabilityService,
  ) { }

  async create(user: User, createSessionDto: CreateSessionDto): Promise<MessageResponse> {
    const { trainerId, clientIds, dateTime, ...data } = createSessionDto;

    // Validate users exist and have correct roles
    const trainer = await this.usersService.findOne({ id: trainerId });



    if (!trainer || trainer.level !== UserLevels[UserRole.TRAINER]) {
      throw new BadRequestException('Invalid trainer ID');
    }

    if (!clientIds || clientIds.length === 0) {
      throw new BadRequestException('Invalid client ID');
    }

    const clients = await this.usersService.findByIds(clientIds);

    if (clients.length === 0) throw new NotFoundException("No valid members found");


    // Check both scheduling conflicts and availability
    const hasConflict = await this.checkSchedulingConflict(trainer.id, dateTime, data.duration);
    if (hasConflict) {
      throw new BadRequestException('Trainer has a scheduling conflict');
    }

    const isAvailable = await this.checkTrainerAvailability(trainer.id, dateTime, data.duration);
    if (!isAvailable) {
      throw new BadRequestException('Trainer is not available during the requested time');
    }

    const session = this.sessionsRepository.create({
      ...data,
      dateTime,
      trainer,
      clients,
      creator: user,
      status: SessionStatus.SCHEDULED
    });

    await this.sessionsRepository.save(session);
    return { message: 'Session created successfully' };
  }

  async findAll(queryDto: SessionListDto, user: User): Promise<PaginationResponse<Session>> {
    const {
      page = 1,
      limit = 10,
      search,
      startDate,
      endDate,
      type,
      status,
      trainerId,
      ...filters
    } = queryDto;

    const skip = (page - 1) * limit;
    const query = this.sessionsRepository.createQueryBuilder('session')
      .leftJoinAndSelect('session.trainer', 'trainer')
      .leftJoinAndSelect('session.creator', 'createdBy')
      .loadRelationCountAndMap('session.clientCount', 'session.clients');



    // Role-based filtering
    const userLevel = user.level;
    if (userLevel === UserLevels[UserRole.TRAINER]) {
      query.where('session.trainer.id = :userId', { userId: user.id });
    } else if (userLevel === UserLevels[UserRole.USER]) {
      query.leftJoin('session.clients', 'clients').
        where('clients.id = :userId', { userId: user.id });
    } else if (userLevel === UserLevels[UserRole.SUPER_ADMIN]) {
      // Admins can see all sessions
    } else {
      throw new ForbiddenException('Invalid role');
    }

    // Apply filters
    if (search) {
      query.andWhere('(session.title ILIKE :search OR session.description ILIKE :search)',
        { search: `%${search}%` });
    }

    if (startDate) {
      query.andWhere('session.dateTime >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('session.dateTime <= :endDate', { endDate });
    }

    if (type) {
      query.andWhere('session.type = :type', { type });
    }

    if (status) {
      query.andWhere('session.status = :status', { status });
    }

    if (trainerId) {
      query.andWhere('trainer.id = :trainerId', { trainerId });
    }

    // Apply sorting
    query.orderBy('session.dateTime', 'ASC');

    const [results, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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

  async findOneById(id: number): Promise<Session> {

    const session = await this.sessionsRepository.findOne({
      where: {
        id,
      },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return session;
  }

  async findOne(id: number, user: User): Promise<Session> {
    const query = this.sessionsRepository
      .createQueryBuilder('session')
      .where('session.id = :id', { id })
      .leftJoinAndSelect('session.creator', 'createdBy')
      .leftJoinAndSelect('session.reminders', 'reminders')
      .leftJoinAndSelect('session.trainer', 'trainer')
      .loadRelationCountAndMap('session.clientCount', 'session.clients')
      .loadAllRelationIds({ relations: ['clients'] })

    // Role-based access control
    const userLevel = user.level;
    if (userLevel === UserLevels[UserRole.TRAINER]) {
      query.andWhere('trainer.id = :userId', { userId: user.id });
    } else if (userLevel === UserLevels[UserRole.USER]) {
      query.andWhere('client.id = :userId', { userId: user.id });
    } else if (userLevel === UserLevels[UserRole.SUPER_ADMIN]) {
      // Admins can see all sessions
    } else {
      throw new ForbiddenException('Invalid role');
    }

    const session = await query.getOne();

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async update(id: number, updateSessionDto: UpdateSessionDto, user: User): Promise<Session> {
    const session = await this.findOne(id, user);

    // Only allow updates for scheduled sessions
    if (session.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestException('Can only update scheduled sessions');
    }

    const { trainerId, clientIds, ...data } = updateSessionDto;

    // Update trainer if specified
    if (trainerId) {
      const trainer = await this.usersService.findOne({ id: trainerId });
      if (!trainer || trainer.level !== UserLevels[UserRole.TRAINER]) {
        throw new BadRequestException('Invalid trainer ID');
      }



      if (data.dateTime || data.duration) {
        const newDateTime = data.dateTime || session.dateTime;
        const newDuration = data.duration || session.duration;

        const hasConflict = await this.checkSchedulingConflict(
          trainerId,
          newDateTime,
          newDuration,
          id // exclude current session
        );
        if (hasConflict) {
          throw new BadRequestException('Trainer has a scheduling conflict');
        }

        const isAvailable = await this.checkTrainerAvailability(trainerId, newDateTime, newDuration);
        if (!isAvailable) {
          throw new BadRequestException('Trainer is not available during the requested time');
        }
      }

      session.trainer = trainer;
    }

    if (clientIds) {
      if (clientIds.length === 0) {
        throw new BadRequestException('Invalid client IDs');
      }

      const clients = await this.usersService.findByIds(clientIds);
      if (clients.length === 0) {
        throw new NotFoundException('No valid clients found');
      }

      session.clients = clients;
    }

    // Update other fields
    Object.assign(session, data);

    await this.sessionsRepository.save(session);
    return this.findOne(session.id, user);
  }

  async updateStatus(id: number, status: SessionStatus, user: User): Promise<Session> {
    const session = await this.findOne(id, user);

    // Validate status transition
    if (!this.isValidStatusTransition(session.status, status)) {
      throw new BadRequestException('Invalid status transition');
    }

    session.status = status;
    session.updatedBy = user;

    await this.sessionsRepository.save(session);
    return this.findOne(session.id, user);
  }

  async remove(id: number, user: User): Promise<MessageResponse> {
    const session = await this.findOne(id, user);

    // Only allow deletion of scheduled sessions
    if (session.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestException('Can only delete scheduled sessions');
    }

    // Check cancellation deadline
    const now = new Date();
    const sessionDate = new Date(session.dateTime);
    const deadlineHours = session.cancellationDeadline || 24;
    const deadlineDate = new Date(sessionDate.getTime() - (deadlineHours * 60 * 60 * 1000));

    if (now > deadlineDate) {
      throw new BadRequestException(`Cannot cancel sessions within ${deadlineHours} hours of start time`);
    }

    await this.sessionsRepository.remove(session);
    return { message: 'Session cancelled successfully' };
  }

  private async checkSchedulingConflict(
    trainerId: number,
    dateTime: Date,
    duration: number,
    excludeSessionId?: number
  ): Promise<boolean> {
    const sessionStart = new Date(dateTime);
    const sessionEnd = new Date(sessionStart.getTime() + duration * 60 * 1000);

    const query = this.sessionsRepository
      .createQueryBuilder('session')
      .where('session.trainer.id = :trainerId', { trainerId })
      .andWhere('session.status = :status', { status: SessionStatus.SCHEDULED })
      .andWhere(
        '(session.dateTime, session.dateTime + session.duration * interval \'1 minute\') OVERLAPS (:start, :end)',
        { start: sessionStart, end: sessionEnd }
      );

    if (excludeSessionId) {
      query.andWhere('session.id != :excludeId', { excludeId: excludeSessionId });
    }

    const conflictCount = await query.getCount();
    return conflictCount > 0;
  }

  private async checkTrainerAvailability(
    trainerId: number,
    dateTime: Date,
    duration: number
  ): Promise<boolean> {
    try {
      // Check if trainer is available during the requested time
      const isAvailable = await this.userAvailabilityService.isUserAvailable(
        trainerId,
        dateTime,
        duration
      );

      return isAvailable;
    } catch (error) {
      console.error('Error checking trainer availability:', error);
      // If availability service fails, allow the session (don't block on availability errors)
      return true;
    }
  }

  private isValidStatusTransition(currentStatus: SessionStatus, newStatus: SessionStatus): boolean {
    // Define valid status transitions
    const validTransitions: Record<SessionStatus, SessionStatus[]> = {
      [SessionStatus.SCHEDULED]: [SessionStatus.IN_PROGRESS, SessionStatus.CANCELLED, SessionStatus.NO_SHOW],
      [SessionStatus.IN_PROGRESS]: [SessionStatus.COMPLETED],
      [SessionStatus.COMPLETED]: [],
      [SessionStatus.CANCELLED]: [],
      [SessionStatus.NO_SHOW]: []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
