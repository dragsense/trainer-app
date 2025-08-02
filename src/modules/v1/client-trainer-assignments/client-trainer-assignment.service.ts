import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ClientTrainerAssignment, AssignmentStatus } from './entities/client-trainer-assignment.entity';
import { CreateClientTrainerAssignmentDto } from './dtos/create-assignment.dto';
import { UpdateClientTrainerAssignmentDto } from './dtos/update-assignment.dto';
import { AssignmentQueryDto } from './dtos/assignment-query.dto';
import { User } from '../users/entities/user.entity';
import { UserRole, UserLevels } from '../users/enums/user.enum';
import { PaginationResponse } from '@/interfaces/pagination-response.interface';

@Injectable()
export class ClientTrainerAssignmentService {
  constructor(
    @InjectRepository(ClientTrainerAssignment)
    private readonly assignmentRepository: Repository<ClientTrainerAssignment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createDto: CreateClientTrainerAssignmentDto,
    createdBy: number,
  ): Promise<ClientTrainerAssignment> {
    // Validate client and trainer exist and have correct roles
    const client = await this.userRepository.findOne({
      where: { id: createDto.clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (client.level !== UserLevels[UserRole.USER]) {
      throw new BadRequestException('Selected user is not a client');
    }

    const trainer = await this.userRepository.findOne({
      where: { id: createDto.trainerId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    if (trainer.level !== UserLevels[UserRole.TRAINER]) {
      throw new BadRequestException('Selected user is not a trainer');
    }

    // Check if assignment already exists
    const existingAssignment = await this.assignmentRepository.findOne({
      where: {
        clientId: createDto.clientId,
        trainerId: createDto.trainerId,
        status: AssignmentStatus.ACTIVE,
      },
    });

    if (existingAssignment) {
      throw new ConflictException('Active assignment already exists between this client and trainer');
    }

    const assignment = this.assignmentRepository.create({
      ...createDto,
      createdBy,
      startDate: createDto.startDate ? new Date(createDto.startDate) : new Date(),
      endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
    });

    return await this.assignmentRepository.save(assignment);
  }

  async findAll(query: AssignmentQueryDto): Promise<PaginationResponse<ClientTrainerAssignment>> {
    const { page = 1, limit = 10, clientId, trainerId, status, clientName, trainerName, startDate, endDate } = query;

    const queryBuilder = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.client', 'client')
      .leftJoinAndSelect('client.profile', 'clientProfile')
      .leftJoinAndSelect('assignment.trainer', 'trainer')
      .leftJoinAndSelect('trainer.profile', 'trainerProfile')
      .leftJoinAndSelect('assignment.creator', 'creator');

    // Apply filters
    if (clientId) {
      queryBuilder.andWhere('assignment.clientId = :clientId', { clientId });
    }

    if (trainerId) {
      queryBuilder.andWhere('assignment.trainerId = :trainerId', { trainerId });
    }

    if (status) {
      queryBuilder.andWhere('assignment.status = :status', { status });
    }

    if (clientName) {
      queryBuilder.andWhere(
        '(clientProfile.firstName ILIKE :clientName OR clientProfile.lastName ILIKE :clientName)',
        { clientName: `%${clientName}%` }
      );
    }

    if (trainerName) {
      queryBuilder.andWhere(
        '(trainerProfile.firstName ILIKE :trainerName OR trainerProfile.lastName ILIKE :trainerName)',
        { trainerName: `%${trainerName}%` }
      );
    }

    if (startDate) {
      queryBuilder.andWhere('assignment.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('assignment.createdAt <= :endDate', { endDate });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const assignments = await queryBuilder
      .orderBy('assignment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: assignments,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: string): Promise<ClientTrainerAssignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['client', 'client.profile', 'trainer', 'trainer.profile', 'creator'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async update(
    id: string,
    updateDto: UpdateClientTrainerAssignmentDto,
    updatedBy: string,
  ): Promise<ClientTrainerAssignment> {
    const assignment = await this.findOne(id);

    Object.assign(assignment, {
      ...updateDto,
      updatedBy,
      startDate: updateDto.startDate ? new Date(updateDto.startDate) : assignment.startDate,
      endDate: updateDto.endDate ? new Date(updateDto.endDate) : assignment.endDate,
    });

    return await this.assignmentRepository.save(assignment);
  }

  async remove(id: string): Promise<void> {
    const assignment = await this.findOne(id);
    await this.assignmentRepository.remove(assignment);
  }

  async deactivate(id: string, updatedBy: string): Promise<ClientTrainerAssignment> {
    return await this.update(id, { status: AssignmentStatus.INACTIVE }, updatedBy);
  }

  async activate(id: string, updatedBy: string): Promise<ClientTrainerAssignment> {
    return await this.update(id, { status: AssignmentStatus.ACTIVE }, updatedBy);
  }

  async findByClient(clientId: string): Promise<ClientTrainerAssignment[]> {
    return await this.assignmentRepository.find({
      where: { clientId, status: AssignmentStatus.ACTIVE },
      relations: ['trainer', 'trainer.profile'],
    });
  }

  async findByTrainer(trainerId: string): Promise<ClientTrainerAssignment[]> {
    return await this.assignmentRepository.find({
      where: { trainerId, status: AssignmentStatus.ACTIVE },
      relations: ['client', 'client.profile'],
    });
  }

  async getAssignmentStats(): Promise<{
    totalAssignments: number;
    activeAssignments: number;
    inactiveAssignments: number;
    clientsWithTrainers: number;
    trainersWithClients: number;
  }> {
    const [
      totalAssignments,
      activeAssignments,
      inactiveAssignments,
      clientsWithTrainers,
      trainersWithClients,
    ] = await Promise.all([
      this.assignmentRepository.count(),
      this.assignmentRepository.count({ where: { status: AssignmentStatus.ACTIVE } }),
      this.assignmentRepository.count({ where: { status: AssignmentStatus.INACTIVE } }),
      this.assignmentRepository
        .createQueryBuilder('assignment')
        .select('COUNT(DISTINCT assignment.clientId)', 'count')
        .where('assignment.status = :status', { status: AssignmentStatus.ACTIVE })
        .getRawOne()
        .then(result => parseInt(result.count)),
      this.assignmentRepository
        .createQueryBuilder('assignment')
        .select('COUNT(DISTINCT assignment.trainerId)', 'count')
        .where('assignment.status = :status', { status: AssignmentStatus.ACTIVE })
        .getRawOne()
        .then(result => parseInt(result.count)),
    ]);

    return {
      totalAssignments,
      activeAssignments,
      inactiveAssignments,
      clientsWithTrainers,
      trainersWithClients,
    };
  }
}
