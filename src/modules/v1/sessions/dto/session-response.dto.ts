import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationMetaDto } from '@/shared-dto/pagination.dto';
import { SessionStatus, SessionType } from '../enums/session.enum';
import { User } from '../../users/entities/user.entity';
import { Profile } from '../../users/profiles/entities/profile.entity';

export class UserBasicDto extends OmitType(User, ['password'] as const) {
  @ApiProperty({ type: () => Profile })
  profile: Profile;
}

export class PaymentBasicDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;
}

export class SessionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: SessionType })
  type: SessionType;

  @ApiProperty()
  dateTime: Date;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  pricePerClient: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ enum: SessionStatus })
  status: SessionStatus;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiProperty()
  requirePrepayment: boolean;

  @ApiProperty()
  cancellationDeadline: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => UserBasicDto })
  trainer: UserBasicDto;

  @ApiProperty({ type: () => [UserBasicDto] })
  clients: UserBasicDto[];

  @ApiProperty()
  isPaid: boolean;

  @ApiProperty()
  canCancel: boolean;
}

export class SessionListResponseDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [SessionResponseDto] })
  @Type(() => SessionResponseDto)
  data: SessionResponseDto[];
}
