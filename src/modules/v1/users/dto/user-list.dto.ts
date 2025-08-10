import { ListQueryDto } from '@/shared-dto/list-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class UserListDto extends ListQueryDto {

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

