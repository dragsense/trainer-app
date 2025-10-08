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
  IsNumber,
  Min
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType} from '@nestjs/swagger';
import { EUserLevels, EUserRole } from '../../enums/user.enum';
import { CreateProfileDto, UpdateProfileDto } from './profile.dto';
import { Type } from 'class-transformer';
import { Profile } from '../../entities/users/profile.entity';
import { PaginationMetaDto } from '../common/pagination.dto';
import { ListQueryDto } from '../common/list-query.dto';
import { IUser } from '../../interfaces/user.interface';
import { FieldOptions, FieldType } from '../../decorators/field.decorator';
import { OmitType } from '../../lib/dto-type-adapter';

export class CreateUserDto {
  @ApiProperty({ example: 'email@example.com', description: 'User email' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @FieldType("email", true)
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
  @FieldType("switch")
  isActive?: boolean;

  @ApiProperty({ type: CreateProfileDto })
  @ValidateNested()
  @Type(() => CreateProfileDto)
  @FieldType("nested", true, CreateProfileDto)
  profile: CreateProfileDto;
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['profile'])) {
  @ApiPropertyOptional({
    example: 'acct_1234567890',
    description: 'Stripe Connect account ID for trainers'
  })
  @IsOptional()
  @IsString()
  stripeConnectAccountId?: string | null;

  @ApiProperty({ type: UpdateProfileDto })
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  @FieldType("nested", true, UpdateProfileDto)
  @IsOptional()
  profile?: UpdateProfileDto;

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

  @IsOptional()
  @IsString()
  @FieldType("text", false)
  search?: string = "";


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
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @FieldType("number", true)
  @Min(1)
  id: number;

  @ApiProperty({ example: 'email@example.com', description: 'User email' })
  @IsOptional()
  @IsString()
  @FieldType("text", false)
  email: string;

  @ApiProperty({ example: EUserLevels[EUserRole.TRAINER], description: 'User role level' })
  @IsOptional()
  @IsIn(Object.values(EUserLevels))
  @FieldType("select")
  @FieldOptions(Object.values(EUserLevels).map(v => ({ value: v.toString(), label: v.toString() })))
  level?: number;
  
  @ApiProperty({ example: true, description: 'User active status' })
  @IsOptional()
  @IsBoolean()
  @FieldType("switch")
  isActive?: boolean;



  @ApiProperty({ type: UpdateProfileDto })
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  @FieldType("nested", true, UpdateProfileDto)
  @IsOptional()
  profile?: UpdateProfileDto;
}

