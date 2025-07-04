import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { CreateSessionDto } from './dtos/create-session.dto';
import { UpdateSessionDto } from './dtos/update-session.dto';
import { SessionListDto } from './dtos/session-list.dto';
import { UsersService } from '../users/users.service';
import { MessageResponse } from '@/interfaces/general.interface';
import { PaginationResponse } from '@/interfaces/pagination-response.interface';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    private readonly usersService: UsersService,
  ) { }

  async create(user: Pick<User, 'id'>, createSessionDto: CreateSessionDto): Promise<MessageResponse> {
    const { clientId } = createSessionDto;
    const client = await this.usersService.findOne({ id: clientId });

    const session = this.sessionsRepository.create({
      ...createSessionDto,
      trainer: user,
      client,
    });

    const savedSession = await this.sessionsRepository.save(session);
    return { message: 'Session created successfully' }
  }

  async findAll(queryDto: SessionListDto, user?: Pick<User, 'id'>): Promise<PaginationResponse<Session>> {
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


    const query = this.sessionsRepository.createQueryBuilder('session')
      .leftJoinAndSelect('session.trainer', 'trainer')
      .leftJoinAndSelect('session.client', 'client');

    if (user) {
      query.andWhere('session.trainer.id = :userId', { userId: user.id });
    }

    if (search) {
      query.where('session.title ILIKE :search', { search: `%${search}%` });
    }

    if (filters && typeof filters === 'object') {
      Object.entries(filters).forEach(([key, value]) => {
        const coercedValue = !isNaN(value as any) ? Number(value) : value;
        if (coercedValue) {
          query.andWhere(`user.${key} = :${key}`, { [key]: value });
        }
      });
    }

    if (createdAfter) {
      query.andWhere('session.createdAt >= :createdAfter', { createdAfter });
    }

    if (createdAfter) {
      query.andWhere('session.createdAt >= :createdAfter', { createdAfter });
    }

    if (createdBefore) {
      query.andWhere('session.createdAt <= :createdBefore', { createdBefore });
    }

    if (updatedAfter) {
      query.andWhere('session.updatedAt >= :updatedAfter', { updatedAfter });
    }

    if (updatedBefore) {
      query.andWhere('session.updatedAt <= :updatedBefore', { updatedBefore });
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

  async findOne(id: number, user: Pick<User, 'id'>): Promise<Session> {
    const session = await this.sessionsRepository.findOne({
      where: { id, trainer: { id: user.id } },
      relations: ['trainer', 'client'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async update(id: number, updateSessionDto: UpdateSessionDto, user: Pick<User, 'id'>): Promise<MessageResponse> {
    const session = await this.findOne(id, user);

    if (updateSessionDto.clientId) {
      const client = await this.usersService.findOne({ id: updateSessionDto.clientId });
      session.client = client;
    }

    Object.assign(session, updateSessionDto);
    await this.sessionsRepository.save(session);

    return { message: 'Session updated successfully' }
  }

  async remove(id: number, user: Pick<User, 'id'>): Promise<void> {
    const session = await this.findOne(id, user);
    await this.sessionsRepository.remove(session);
  }



}
