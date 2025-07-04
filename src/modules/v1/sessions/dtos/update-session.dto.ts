import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionDto } from './create-session.dto';
import { IsNumber, IsString, IsUUID } from 'class-validator';
import { SessionStatus } from '../enums/session.eum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @ApiPropertyOptional({
    description: 'Status of the session',
    enum: SessionStatus,
    example: SessionStatus.SCHEDULED,
  })
  @IsString()
  status?: SessionStatus;

}
