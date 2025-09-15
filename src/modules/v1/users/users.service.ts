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
import { UserEmailService } from './services/user-email.service';
import { UserListDto } from './dto/user-list.dto';
import { TrainerClientsService } from '../trainer-clients/trainer-clients.service';

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
    private readonly userEmailService: UserEmailService,
    private readonly trianerClientService: TrainerClientsService
  ) { }

  async findOne(
    where: FindOptionsWhere<User>,
    options?: {
      select?: (keyof User)[];
      relations?: string[];
    }
  ): Promise<User> {
    const { select = [], relations = ['profile'] } = options || {};

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
    queryDto: UserListDto,
    currentUser: User
  ): Promise<PaginationResponse<User>> {
    const {
      page = 1,
      limit = 10,
      search,
      level,
      trainerId,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      ...filters
    } = queryDto;

    const skip = (page - 1) * limit;
    const query = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.image', 'image')
      .leftJoinAndSelect('user.owner', 'owner');

    // Role-based filtering
    const userLevel = currentUser.level;
    if (userLevel === UserLevels[UserRole.TRAINER]) {
      query.where('owner.id = :userId', { userId: currentUser.id });
    } else if (userLevel === UserLevels[UserRole.SUPER_ADMIN]) {
      query.where('user.level != :superAdminLevel', {
        superAdminLevel: UserLevels[UserRole.SUPER_ADMIN],
      });
    }
    else {
      throw new ForbiddenException('Invalid role');
    }

    // Apply filters
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
      query.andWhere('createdBy.id = :trainerId', { trainerId });
    }


    if (filters && typeof filters === 'object') {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query.andWhere(`user.${key} && ARRAY[:...${key}]`, { [key]: value });
          } else {
            const coercedValue = !isNaN(value as any) ? Number(value) : value;
            query.andWhere(`user.${key} = :${key}`, { [key]: coercedValue });
          }
        }
      });
    }

    if (createdAfter) {
      query.andWhere('user.createdAt >= :createdAfter', { createdAfter });
    }

    if (createdBefore) {
      query.andWhere('user.createdAt <= :createdBefore', { createdBefore });
    }

    if (updatedAfter) {
      query.andWhere('user.updatedAt >= :updatedAfter', { updatedAfter });
    }

    if (updatedBefore) {
      query.andWhere('user.updatedAt <= :updatedBefore', { updatedBefore });
    }

    const sortColumn = sortBy && sortBy in this.userRepo.metadata.propertiesMap
      ? sortBy
      : 'createdAt';

    query
      .orderBy(`user.${sortColumn}`, sortOrder.toUpperCase() as "ASC" | "DESC")
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

  async create(createUserDto: CreateUserDto, currentUser?: User): Promise<MessageResponse> {

    const {
      profile: profileDtoData,
      ...userDtoData
    } = createUserDto;

    // Check if email exists
    const existingUser = await this.userRepo.findOne({
      where: { email: userDtoData.email },
    });


    if (userDtoData.level !== UserLevels[UserRole.USER] && currentUser?.level === UserLevels[UserRole.TRAINER]) {
      throw new ForbiddenException('Trainers can only create clients');
    }

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    let owner: User;
    let tempPassword: string;

    if (currentUser) {
      owner = await this.findOne({ id: currentUser.id }, { select: ['id'] });
    }

    if (!userDtoData.password) {
      tempPassword = this.generateStrongPassword(12);
      userDtoData.password = tempPassword;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userDtoData.password, salt);

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // Create user
      const userData: DeepPartial<User> = {
        email: userDtoData.email,
        password: hashedPassword,
        level: userDtoData.level,
        isActive: userDtoData.isActive,
        owner,
      };

      // Track created by is handled through audit columns
      const user = manager.create(User, userData);
      await manager.save(user);

      // Create profile
      const profileData: DeepPartial<Profile> = {
        ...profileDtoData,
        user: { id: user.id } as DeepPartial<User>,
      };

      const profile = manager.create(Profile, profileData);
      await manager.save(profile);

      user.profile = profile;

      // Create default app settings
      const appSettingData: DeepPartial<AppSetting> = {
        allowNotification: true,
        user: { id: user.id } as DeepPartial<User>,
      };
      const appSetting = manager.create(AppSetting, appSettingData);
      await manager.save(appSetting);

      // Create default notification settings
      const notificationSettingData: DeepPartial<NotificationSetting> = {
        emailNotifications: true,
        newUserNotifications: true,
        userUpdateNotifications: true,
        billingNotifications: true,
        sessionNotifications: true,
        user: { id: user.id } as DeepPartial<User>,
      };
      const notificationSetting = manager.create(NotificationSetting, notificationSettingData);
      await manager.save(notificationSetting);

      if (tempPassword) {
        this.userEmailService.sendOnboardingEmail({
          user,
          tempPassword,
          createdBy: currentUser,
        }).catch((error) =>
          console.error('Onboarding email failed', error),
        );
        user.password = tempPassword;
      }


      if (user.level === UserLevels[UserRole.USER] && currentUser?.level === UserLevels[UserRole.TRAINER]) {
        this.trianerClientService.assignTrainerToClient({
          trainerId: currentUser.id,
          clientId: user.id,
        });
      }

      return { message: 'User created successfully.', user };
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {

    const { profile: profileDtoData, ...userDtoData } = updateUserDto;

    const user = await this.findOne({ id }, { relations: ['profile'] });

    // Check email uniqueness if changed
    if (userDtoData.email && userDtoData.email !== user.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: userDtoData.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // Update user
      if (userDtoData.email) {
        user.email = userDtoData.email;
      }

      if (userDtoData.isActive !== undefined) {
        user.isActive = userDtoData.isActive;
      }

      if (user.profile) {
        Object.assign(user.profile, profileDtoData);
      }

      await manager.save(user);


      return user;
    });
  }

  async remove(id: number, currentUser: User): Promise<MessageResponse> {
    const user = await this.findOne({ id }, { relations: ['owner'] });

    // Only admins can delete users, and they cannot delete super admins
    if (user.level === UserLevels[UserRole.SUPER_ADMIN]
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
    resetPasswordDto: ResetPasswordDto,
    force: boolean = false
  ): Promise<MessageResponse> {
    const { currentPassword, newPassword } = resetPasswordDto;

    const user = await this.findOne({ id }, { select: ['id', 'password'] });

    if (!force) {
      if (!currentPassword) {
        throw new ConflictException('Current password is required');
      }

      const isOldPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isOldPasswordValid) {
        throw new ConflictException('Old password is incorrect');
      }
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      throw new ConflictException('New password must be different from the old password');
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);
    await this.userRepo.save(user);

    // Send password reset confirmation email
    this.userEmailService.sendPasswordResetConfirmation(user).catch((error) =>
      console.error('Password reset confirmation email failed', error),
    );

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
      profile: {
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName
      }

    });
  }
}
