import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTrainerClientDto } from 'shared/dtos';
import { TrainerClient } from 'shared/entities';
import { User } from 'shared/entities';
import { IMessageResponse, IPaginatedResponse } from 'shared/interfaces';
import { TrainerClientListDto } from 'shared/dtos';

@Injectable()
export class TrainerClientsService {
  constructor(
    @InjectRepository(TrainerClient)
    private trainerClientRepository: Repository<TrainerClient>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async assignTrainerToClient(createTrainerClientDto: CreateTrainerClientDto): Promise<IMessageResponse> {
    const { trainer, client } = createTrainerClientDto;

    // Check if assignment already exists
    const existing = await this.trainerClientRepository.findOne({
      where: { trainer: { id: trainer.id }, client: { id: client.id } }
    });

    if (existing) {
      throw new ConflictException('Client is already assigned to this trainer');
    }

    const assignment = this.trainerClientRepository.create({
      trainer: { id: trainer.id },
      client: { id: client.id }
    });

    await this.trainerClientRepository.save(assignment);

    return {message: 'Trainer assigned to client successfully'};
  }


  async findAll(queryDto: TrainerClientListDto): Promise<IPaginatedResponse<TrainerClient>> {
    const {
      page = 1,
      limit = 10,
      search,
      clientId,
      trainerId,
      trainerEmail,
      clientEmail,
      trainerFirstName,
      trainerLastName,
      clientFirstName,
      clientLastName,
      assignedDateFrom,
      assignedDateTo,
      trainerSpecialty,
      clientGoal,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      ...otherFilters
    } = queryDto;

    const queryBuilder = this.trainerClientRepository
      .createQueryBuilder('trainerClient')
      .leftJoinAndSelect('trainerClient.trainer', 'trainer')
      .leftJoinAndSelect('trainer.profile', 'trainerProfile')
      .leftJoinAndSelect('trainerClient.client', 'client')
      .leftJoinAndSelect('client.profile', 'clientProfile');

    // Basic ID filters
    if (trainerId) {
      queryBuilder.andWhere('trainerClient.trainerId = :trainerId', { trainerId });
    }

    if (clientId) {
      queryBuilder.andWhere('trainerClient.clientId = :clientId', { clientId });
    }

    // Email filters
    if (trainerEmail) {
      queryBuilder.andWhere('trainer.email ILIKE :trainerEmail', { 
        trainerEmail: `%${trainerEmail}%` 
      });
    }

    if (clientEmail) {
      queryBuilder.andWhere('client.email ILIKE :clientEmail', { 
        clientEmail: `%${clientEmail}%` 
      });
    }

    // Name filters
    if (trainerFirstName) {
      queryBuilder.andWhere('trainerProfile.firstName ILIKE :trainerFirstName', { 
        trainerFirstName: `%${trainerFirstName}%` 
      });
    }

    if (trainerLastName) {
      queryBuilder.andWhere('trainerProfile.lastName ILIKE :trainerLastName', { 
        trainerLastName: `%${trainerLastName}%` 
      });
    }

    if (clientFirstName) {
      queryBuilder.andWhere('clientProfile.firstName ILIKE :clientFirstName', { 
        clientFirstName: `%${clientFirstName}%` 
      });
    }

    if (clientLastName) {
      queryBuilder.andWhere('clientProfile.lastName ILIKE :clientLastName', { 
        clientLastName: `%${clientLastName}%` 
      });
    }

    // Date range filters
    if (assignedDateFrom) {
      queryBuilder.andWhere('trainerClient.assignedAt >= :assignedDateFrom', { assignedDateFrom });
    }

    if (assignedDateTo) {
      queryBuilder.andWhere('trainerClient.assignedAt <= :assignedDateTo', { assignedDateTo });
    }

    // Specialty and goal filters
    if (trainerSpecialty) {
      queryBuilder.andWhere('trainerProfile.specialties @> :trainerSpecialty', { 
        trainerSpecialty: JSON.stringify([trainerSpecialty])
      });
    }

    if (clientGoal) {
      queryBuilder.andWhere('clientProfile.fitnessGoals @> :clientGoal', { 
        clientGoal: JSON.stringify([clientGoal])
      });
    }

    // Search functionality
    if (search) {
      queryBuilder.andWhere(
        `(LOWER(trainerProfile.firstName) LIKE LOWER(:search) OR 
         LOWER(trainerProfile.lastName) LIKE LOWER(:search) OR 
         LOWER(clientProfile.firstName) LIKE LOWER(:search) OR 
         LOWER(clientProfile.lastName) LIKE LOWER(:search) OR
         LOWER(trainer.email) LIKE LOWER(:search) OR
         LOWER(client.email) LIKE LOWER(:search))`,
        { search: `%${search}%` }
      );
    }

    // Date range filters
    if (createdAfter) {
      queryBuilder.andWhere('trainerClient.assignedAt >= :createdAfter', { createdAfter });
    }

    if (createdBefore) {
      queryBuilder.andWhere('trainerClient.assignedAt <= :createdBefore', { createdBefore });
    }

    // Handle any other filters
    if (otherFilters && typeof otherFilters === 'object') {
      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value && value !== undefined && value !== null) {
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
