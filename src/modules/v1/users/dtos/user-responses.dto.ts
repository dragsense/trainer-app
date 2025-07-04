import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { PaginationMetaDto } from '@/shared-dto/pagination.dto';

import { User } from '../entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';

export class UserSafeDto extends OmitType(User, ['password'] as const) {}

export class UserWithProfileSafeDto extends UserSafeDto {
  @ApiProperty({ type: () => Profile })
  profile: Profile;
}

export class UserPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [UserSafeDto] })
  @Type(() => UserSafeDto)
  data: UserSafeDto[];
}
