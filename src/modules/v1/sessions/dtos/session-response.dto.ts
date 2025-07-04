import { ApiProperty } from '@nestjs/swagger';
import { Session } from '../entities/session.entity';
import { Type } from 'class-transformer';
import { PaginationMetaDto } from '@/shared-dto/pagination.dto';




export class SessionPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [Session] })
  @Type(() => Session)
  data: Session[];
}
