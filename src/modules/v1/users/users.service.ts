import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository, FindOptionsWhere, DeepPartial, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { Profile } from './profiles/entities/profile.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole, UserLevels } from './enums/user.enum';
import { MessageResponse } from '@/interfaces/general.interface';
import { PaginationResponse } from '@/interfaces/pagination-response.interface';
import { ListQueryDto } from '@/shared-dto/list-query.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { AppSetting } from '../settings/app-setting/entities/app-setting.entity';
import { NotificationSetting } from '../settings/notification-settings/entities/notification-setting.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailerService: MailerService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    @InjectRepository(AppSetting)
    private readonly appSettingRepo: Repository<AppSetting>,
    @InjectRepository(NotificationSetting)
    private readonly notificationSettingRepo: Repository<NotificationSetting>,
  ) { }

  async findOne(
    where: FindOptionsWhere<User>,
    options?: {
      select?: (keyof User)[];
      relations?: string[];
    }
  ): Promise<User> {
    const { select = ['id', 'email', 'level'], relations = ['profile'] } = options || {};

    const user = await this.userRepo.findOne({
      where,
      select,
      relations,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }


  async findByIds(
    ids: number[],
  ): Promise<User[]> {

    return this.userRepo.findBy({
      id: In(ids),
    });
  }

  async findAll(
    {
      page = 1,
      limit = 10,
      search,
      level,
      trainerId,
    }: ListQueryDto & { level?: number; trainerId?: number },
    currentUser: User
  ): Promise<PaginationResponse<User>> {
    const skip = (page - 1) * limit;
    const query = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')

    // Role-based filtering
    switch (currentUser.level) {
      case UserLevels[UserRole.TRAINER]:
        // Trainers can only see their clients
        query.where('trainer.id = :trainerId', { trainerId: currentUser.id });
        break;
      case UserLevels[UserRole.ADMIN]:
        // Admins can see all except super admin
        query.where('user.level != :superAdminLevel', {
          superAdminLevel: UserLevels[UserRole.SUPER_ADMIN]
        });
        break;
      case UserLevels[UserRole.SUPER_ADMIN]:
        // Super admins can see everyone
        break;
      default:
        throw new ForbiddenException('Invalid role');
    }

    if (search) {
      query.andWhere(
        '(user.email ILIKE :search OR profile.firstName ILIKE :search OR profile.lastName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (level) {
      query.andWhere('user.level = :level', { level });
    }

    if (trainerId) {
      query.andWhere('user.createdBy.id = :trainerId', { trainerId });
    }

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };
  }


  private generateStrongPassword(length: number): string {
    const chars = {
      alpha: 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz',
      numeric: '23456789',
      special: '!@#$%^&*',
    };

    let password = '';
    // Ensure at least one of each type
    password += chars.alpha.charAt(
      Math.floor(Math.random() * chars.alpha.length),
    );
    password += chars.numeric.charAt(
      Math.floor(Math.random() * chars.numeric.length),
    );
    password += chars.special.charAt(
      Math.floor(Math.random() * chars.special.length),
    );

    // Fill remaining with random characters
    const allChars = chars.alpha + chars.numeric + chars.special;
    for (let i = password.length; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  private async sendWelcomeEmail(
    user: User,
    tempPassword: string,
  ): Promise<void> {

    const appConfig = this.configService.get('app');


    const appUrl = appConfig.appUrl;
    const appName = appConfig.name;
    const loginPath = appConfig.loginPath;
    const loginUrl = `${appUrl}/${loginPath}`;
    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get('MAIL_FROM'),
      subject: `Welcome to ${appName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h3>Welcome to ${appName}</h3>
          <p>Your account has been created successfully.</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p style="color: #d32f2f; font-weight: 500;">
            Note: This is a temporary password. Please change it after login.
          </p>
          <a href="${loginUrl}" style="
            display: inline-block;
            padding: 10px 20px;
            background: #2196f3;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 10px;
          ">
            Login to ${appName}
          </a>
        </div>
      `,
      text: `Your account has been created successfully.`,
    });
  }

  async create(createUserDto: CreateUserDto, currentUser?: User): Promise<MessageResponse> {

    // Check if email exists
    const existingUser = await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    let owner: User;
    let tempPassword: string;

    if (currentUser) {
      owner = await this.findOne({ id: currentUser.id }, { select: ['id'] });
    }

    if (!createUserDto.password) {
      tempPassword = this.generateStrongPassword(12);
      createUserDto.password = tempPassword;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    return await this.dataSource.transaction(async (manager: EntityManager) => {

      // Create user
      const userData: DeepPartial<User> = {
        email: createUserDto.email,
        password: hashedPassword,
        level: createUserDto.level,
        isActive: createUserDto.isActive,
        owner,
      };

      // Track created by is handled through audit columns
      const user = manager.create(User, userData);
      await manager.save(user);

      // Create profile
      const profileData: DeepPartial<Profile> = {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phoneNumber: createUserDto.phoneNumber,
        dateOfBirth: createUserDto.dateOfBirth,
        gender: createUserDto.gender,
        address: createUserDto.address,
        bio: createUserDto.bio,
        specialties: createUserDto.specialties,
        certifications: createUserDto.certifications,
        avatar: createUserDto.avatar,
        availabilityZones: createUserDto.availabilityZones,
        availableTimeSlots: createUserDto.availableTimeSlots,
        experience: createUserDto.experience,
        rating: createUserDto.rating,
        fitnessGoals: createUserDto.fitnessGoals,
        preferredTrainerGender: createUserDto.preferredTrainerGender,
        preferredWorkoutTimes: createUserDto.preferredWorkoutTimes,
        user: { id: user.id } as DeepPartial<User>,
      };

      const profile = manager.create(Profile, profileData);
      await manager.save(profile);

      user.profile = profile;

      if (tempPassword) {
        this.sendWelcomeEmail(user, tempPassword).catch((error) =>
          console.error('Welcome email failed', error),
        );
        user.password = tempPassword;
      }

      const appSetting = this.appSettingRepo.create({
        user: { id: user.id },
      });
      await manager.save(this.appSettingRepo.target, appSetting);

      const notificationSetting = this.notificationSettingRepo.create({
        user: { id: user.id },
      });
      await manager.save(this.notificationSettingRepo.target, notificationSetting);


      return { message: 'User created successfully.', user };
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne({ id }, { relations: ['profile'] });


    // Check email uniqueness if changed
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // Update user
      if (updateUserDto.email) {
        user.email = updateUserDto.email;
      }

      if (updateUserDto.isActive !== undefined) {
        user.isActive = updateUserDto.isActive;
      }

      await manager.save(user);

      // Update profile
      if (user.profile) {
        const profileData: DeepPartial<Profile> = {};
        const profileFields = [
          'firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'gender',
          'address', 'bio', 'specialties', 'certifications', 'avatar',
          'availabilityZones', 'availableTimeSlots', 'experience', 'rating',
          'fitnessGoals', 'preferredTrainerGender', 'preferredWorkoutTimes'
        ];

        profileFields.forEach(field => {
          if (updateUserDto[field] !== undefined) {
            profileData[field] = updateUserDto[field];
          }
        });

        if (Object.keys(profileData).length > 0) {
          Object.assign(user.profile, profileData);
          await manager.save(user.profile);
        }
      }

      return user;
    });
  }

  async remove(id: number, currentUser: User): Promise<MessageResponse> {
    const user = await this.findOne({ id }, { relations: ['createdBy'] });

    // Only admins can delete users, and they cannot delete super admins
    if (
      currentUser.level < UserLevels[UserRole.ADMIN] ||
      user.level === UserLevels[UserRole.SUPER_ADMIN]
    ) {
      throw new ForbiddenException('Insufficient permissions to delete this user');
    }

    await this.userRepo.remove(user);

    return {
      message: 'User deleted successfully',
    };
  }

  async resetPassword(
    id: number,
    resetPasswordDto: ResetPasswordDto
  ): Promise<MessageResponse> {
    const user = await this.findOne({ id }, { select: ['id', 'password'] });

    // Hash and update password
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(resetPasswordDto.newPassword, salt);
    await this.userRepo.save(user);

    return {
      message: 'Password reset successfully',
    };
  }

  async createSuperAdminIfNotExists(): Promise<void> {
    const existingSuperAdmin = await this.userRepo.findOne({
      where: { level: UserLevels[UserRole.SUPER_ADMIN] }
    });

    if (existingSuperAdmin) {
      return;
    }

    const superAdmin = this.configService.getOrThrow('app.superAdmin');
    await this.create({
      email: superAdmin.email,
      password: superAdmin.password,
      level: UserLevels[UserRole.SUPER_ADMIN],
      firstName: superAdmin.firstName,
      lastName: superAdmin.lastName
    });
  }

}
