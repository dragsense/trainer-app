import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Length,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsDateString,
  IsEnum,
  IsUrl,
  IsArray,
  MinLength,
  IsBoolean
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserLevels, UserRole } from '../enums/user.enum';
import { UserLevelType, UserLevelValues } from '../entities/user.entity';
import { CreateProfileDto } from '../profiles/dto/create-profile.dto';

export class CreateUserDto extends CreateProfileDto {
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
    example: UserLevels[UserRole.TRAINER],
    enum: UserLevelValues,
    description: 'User role level'
  })
  @IsIn(Object.values(UserLevels))
  level: UserLevelType;


  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

}
