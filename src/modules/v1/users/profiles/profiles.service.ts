import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MessageResponse } from '@/interfaces/general.interface';


import { Profile } from './entities/profile.entity';
import { User } from '../entities/user.entity';


import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) { }

  async findOneByUser(user: Pick<User, "id">): Promise<Profile> {

    const userId = user.id;

    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user with ID ${userId} not found`);
    }

    return profile;
  }

  async update(id: number, updateProfileDto: UpdateProfileDto): Promise<MessageResponse> {
    const profile = await this.profileRepo.preload({
      id,
      ...updateProfileDto,
    });

    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    await this.profileRepo.save(profile);

    return { message: 'Profile updated successfully' };
  }

}
