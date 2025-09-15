import { ListQueryDto } from '@/shared-dto/list-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { User } from '../entities/user.entity';

export class UserListDto extends ListQueryDto<User> {

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

