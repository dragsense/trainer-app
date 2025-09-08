import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationMetaDto } from '@/shared-dto/pagination.dto';
import { SessionStatus, SessionType } from '../enums/session.enum';

export class UserBasicDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;
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
  startTime: Date;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ enum: SessionStatus })
  status: SessionStatus;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional()
  maxParticipants?: number;

  @ApiProperty()
  requirePrepayment: boolean;

  @ApiProperty()
  cancellationDeadline: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdById: number;

  @ApiProperty()
  updatedById: number;

  @ApiProperty({ type: () => UserBasicDto })
  createdBy: UserBasicDto;

  @ApiProperty({ type: () => UserBasicDto })
  trainer: UserBasicDto;

  @ApiProperty({ type: () => UserBasicDto })
  client: UserBasicDto;

  @ApiPropertyOptional({ type: () => [PaymentBasicDto] })
  payments?: PaymentBasicDto[];

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
