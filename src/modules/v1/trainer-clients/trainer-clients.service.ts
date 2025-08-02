import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTrainerClientDto } from './dto/create-trainer-client.dto';
import { TrainerClient } from './entities/trainer-client.entity';
import { User } from '../users/entities/user.entity';
import { MessageResponse } from '@/interfaces/general.interface';
import { TrainerClientListDto } from './dto/trainer-client-list.dto';
import { PaginationResponse } from '@/interfaces/pagination-response.interface';

@Injectable()
export class TrainerClientsService {
  constructor(
    @InjectRepository(TrainerClient)
    private trainerClientRepository: Repository<TrainerClient>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async assignTrainerToClient(createTrainerClientDto: CreateTrainerClientDto): Promise<MessageResponse> {
    const { trainerId, clientId } = createTrainerClientDto;

    // Check if assignment already exists
    const existing = await this.trainerClientRepository.findOne({
      where: { trainer: { id: trainerId }, client: { id: clientId } }
    });

    if (existing) {
      throw new ConflictException('Client is already assigned to this trainer');
    }

    const assignment = this.trainerClientRepository.create({
      trainer: { id: trainerId },
      client: { id: clientId }
    });

    await this.trainerClientRepository.save(assignment);

    return {message: 'Trainer assigned to client successfully'};
  }


  async findAll(queryDto: TrainerClientListDto): Promise<PaginationResponse<TrainerClient>> {
    const {
      page = 1,
      limit = 10,
      search,
      clientId,
      trainerId,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      ...filters
    } = queryDto;

    const queryBuilder = this.trainerClientRepository
      .createQueryBuilder('trainerClient')
      .leftJoinAndSelect('trainerClient.trainer', 'trainer')
      .leftJoinAndSelect('trainer.profile', 'trainerProfile')
      .leftJoinAndSelect('trainerClient.client', 'client')
      .leftJoinAndSelect('client.profile', 'clientProfile');

    // Add filters
    if (trainerId) {
      queryBuilder.andWhere('trainerClient.trainerId = :trainerId', { trainerId });
    }

    if (clientId) {
      queryBuilder.andWhere('trainerClient.clientId = :clientId', { clientId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(trainerProfile.firstName) LIKE LOWER(:search) OR LOWER(trainerProfile.lastName) LIKE LOWER(:search) OR LOWER(clientProfile.firstName) LIKE LOWER(:search) OR LOWER(clientProfile.lastName) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    // Use assignedAt instead of createdAt/updatedAt since those don't exist in the entity
    if (createdAfter) {
      queryBuilder.andWhere('trainerClient.assignedAt >= :createdAfter', { createdAfter });
    }

    if (createdBefore) {
      queryBuilder.andWhere('trainerClient.assignedAt <= :createdBefore', { createdBefore });
    }

    // Remove updatedAfter and updatedBefore since entity doesn't have updatedAt
    if (filters && typeof filters === 'object') {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryBuilder.andWhere(`trainerClient.${key} = :${key}`, { [key]: value });
        }
      });
    }

    queryBuilder
      .orderBy('trainerClient.assignedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [results, total] = await queryBuilder.getManyAndCount();
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

  async findOne(id: number): Promise<TrainerClient> {
    const assignment = await this.trainerClientRepository.findOne({
      where: { id },
      relations: ['trainer', 'client']
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async removeAssignment(id: number) {
    const assignment = await this.trainerClientRepository.findOne({
      where: { id }
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    await this.trainerClientRepository.remove(assignment);
    return { message: 'Assignment removed successfully' };
  }

  async removeTrainerFromClient(trainerId: number, clientId: number) {
    const assignment = await this.trainerClientRepository.findOne({
      where: { trainer: { id: trainerId }, client: { id: clientId } }
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    await this.trainerClientRepository.remove(assignment);
    return { message: 'Trainer removed from client successfully' };
  }
}
