import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import * as bcrypt from 'bcrypt';

import { MessageResponse } from '@/interfaces/general.interface';

import { User } from './entities/user.entity';
import { Profile } from './profiles/entities/profile.entity';

import {
  CreateUserDto,
} from './dtos/create-user.dto';
import {
  ResetPasswordDto,
} from './dtos/update-user.dto';
import { CreateProfileDto } from './profiles/dto/create-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) { }


  async findOne(
    where: Partial<Record<keyof User, any>>,
    options?: {
      select?: (keyof User)[],
      relations?: string[],
    },
  ): Promise<User> {
    const { select = ['id', 'email'], relations = [] } = options || {};

    const query = this.userRepo.createQueryBuilder('user');

    Object.entries(where).forEach(([key, value]) => {
      query.andWhere(`user.${key} = :${key}`, { [key]: value });
    });

    const selects = select.map((field) => `user.${field}`);
    query.select(selects);

    for (const relation of relations) {
      query.leftJoinAndSelect(`user.${relation}`, relation);
    }

    const user = await query.getOne();

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }



  async create(
    createUserDto: CreateUserDto,
  ): Promise<MessageResponse> {
    const {
      email,
      firstName,
      lastName,
      password
    } = createUserDto;


    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const existingUser = await this.findOne({ email });
      if (existingUser) {
        throw new HttpException(
          'The email is already taken',
          HttpStatus.CONFLICT,
        );
      }

      const encryptedPassword = await bcrypt.hash(password, 12);

      const user = this.userRepo.create({
        email,
        password: encryptedPassword
      });

      const savedUser = await manager.save(this.userRepo.target, user);

      const profile = this.profileRepo.create({
        firstName,
        lastName,
        user: { id: savedUser.id },
      });

      await manager.save(this.profileRepo.target, profile);
      return {
        message: 'User created successfully',
      };
    });
  }

  async createUserWithProfile(
    createUserProfileDto: CreateUserDto & CreateProfileDto,
    manager?: EntityManager
  ): Promise<User> {
    const run = async (em: EntityManager): Promise<User> => {
      const {
        firstName,
        lastName,
        email,
        password,
        address,
        gender,
        contactPhone,
      } = createUserProfileDto;

      const existingUser = await this.findOne({ email });

      if (existingUser) {
        throw new HttpException('The email is already taken', HttpStatus.CONFLICT);
      }

      const encryptedPassword = await bcrypt.hash(password, 12);

      const user = this.userRepo.create({ email, password: encryptedPassword });
      const savedUser = await em.save(this.userRepo.target, user);

      const profile = this.profileRepo.create({
        firstName,
        lastName,
        address,
        gender,
        contactPhone,
        user: { id: savedUser.id },
      });

      await em.save(this.profileRepo.target, profile);

      return savedUser;
    };

    return manager
      ? await run(manager)
      : await this.dataSource.transaction(run);
  }

  async updateUserWithProfile(
    userId: number,
    updateUserProfileDto: Partial<CreateUserDto & CreateProfileDto>,
    manager?: EntityManager
  ): Promise<User> {
    const run = async (em: EntityManager): Promise<User> => {
      const {
        email,
        password,
        firstName,
        lastName,
        address,
        gender,
        contactPhone,
      } = updateUserProfileDto;

      const user = await this.findOne({ id: userId }, {
        relations: ['profile'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (email && email !== user.email) {
        const existingUser = await this.findOne({ email });

        if (existingUser) {
          throw new HttpException('The email is already taken', HttpStatus.CONFLICT);
        }

        user.email = email;
      }

      if (password) {
        user.password = await bcrypt.hash(password, 12);
      }

      await em.save(this.userRepo.target, user);

      await em.update(this.profileRepo.target, { user: { id: userId } }, {
        firstName,
        lastName,
        address,
        gender,
        contactPhone,
      });

      return user;
    };

    return manager
      ? await run(manager)
      : await this.dataSource.transaction(run);
  }

  async resetPassword(
    userId: number,
    resetDto: ResetPasswordDto,
  ): Promise<MessageResponse> {
    const { newPassword } = resetDto;

    let user: User | null;

    user = await this.findOne({ id: userId }, { select: ['id', 'password'] });
    if (!user) throw new NotFoundException('User not found');

    const isSame = await bcrypt.compare(newPassword, user.password);

    if (isSame)
      throw new BadRequestException(
        'New password cannot be the same as the current password',
      );

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);

    return { message: 'Password reset successfully' };
  }

  async remove(id: number): Promise<void> {
    const existingUser = await this.findOne({ id });
    if (!existingUser) throw new NotFoundException('User not found');
    await this.userRepo.remove(existingUser);
  }
}
