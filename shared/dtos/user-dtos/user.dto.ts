import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Length,
  IsIn,
  IsOptional,
  MinLength,
  IsBoolean,
  ValidateNested,
  IsNumber
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { EUserLevels, EUserRole } from '../../enums/user.enum';
import { CreateProfileDto } from './profile.dto';
import { Type } from 'class-transformer';
import { Profile } from '../../entities/users/profile.entity';
import { PaginationMetaDto } from '../common/pagination.dto';
import { ListQueryDto } from '../common/list-query.dto';
import { IUser } from '../../interfaces/user.interface';

export class CreateUserDto {
  @ApiProperty({ example: 'email@example.com', description: 'User email' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: 'securePass123',
    description: 'User password (min 6 chars, must include letters and numbers)'
  })
  @IsString()
  @IsOptional()
  @Length(6, 100)
  @MinLength(6)
  password?: string;

  @ApiProperty({
    example: EUserLevels[EUserRole.TRAINER],
    description: 'User role level'
  })
  @IsIn(Object.values(EUserLevels))
  level: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: CreateProfileDto })
  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile: CreateProfileDto;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: 'acct_1234567890',
    description: 'Stripe Connect account ID for trainers'
  })
  @IsOptional()
  @IsString()
  stripeConnectAccountId?: string | null;
}

export class UserSafeDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'email@example.com', description: 'User email' })
  email: string;

  @ApiProperty({
    example: EUserLevels[EUserRole.TRAINER],
    enum: Object.values(EUserLevels),
    description: 'User role level'
  })
  level: number;

  @ApiPropertyOptional({ example: true, description: 'User active status' })
  isActive?: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update date' })
  updatedAt: Date;
}

export class UserWithProfileSafeDto extends UserSafeDto {
  @ApiProperty({ type: () => Profile })
  profile: Profile;
}

export class UserPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [UserSafeDto] })
  @Type(() => UserSafeDto)
  data: UserSafeDto[];
}

export class UserListDto extends ListQueryDto<IUser> {
  @ApiPropertyOptional({
      description: 'Filter by user level',
      type: Number,
      example: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  level?: number;

  @ApiPropertyOptional({
      description: 'Filter by trainer ID',
      example: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  trainerId?: number;
}


export class UserDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: number;
}

