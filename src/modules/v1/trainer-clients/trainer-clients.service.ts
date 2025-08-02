import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTrainerClientDto } from './dto/create-trainer-client.dto';
import { UpdateTrainerClientDto } from './dto/update-trainer-client.dto';
import { TrainerClient } from './entities/trainer-client.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TrainerClientsService {
  constructor(
    @InjectRepository(TrainerClient)
    private trainerClientRepository: Repository<TrainerClient>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async assignTrainerToClient(createTrainerClientDto: CreateTrainerClientDto) {
    const { trainerId, clientId } = createTrainerClientDto;

    // Check if assignment already exists
    const existing = await this.trainerClientRepository.findOne({
      where: { trainerId, clientId }
    });

    if (existing) {
      throw new ConflictException('Client is already assigned to this trainer');
    }

    const assignment = this.trainerClientRepository.create({
      trainerId,
      clientId
    });

    return await this.trainerClientRepository.save(assignment);
  }

  async getTrainerClients(trainerId: number) {
    return await this.trainerClientRepository.find({
      where: { trainerId },
      relations: ['client', 'client.profile']
    });
  }

  async getClientTrainers(clientId: number) {
    return await this.trainerClientRepository.find({
      where: { clientId },
      relations: ['trainer', 'trainer.profile']
    });
  }

  async findAll() {
    return await this.trainerClientRepository.find({
      relations: ['trainer', 'trainer.profile', 'client', 'client.profile']
    });
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
      where: { trainerId, clientId }
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    await this.trainerClientRepository.remove(assignment);
    return { message: 'Trainer removed from client successfully' };
  }
}
