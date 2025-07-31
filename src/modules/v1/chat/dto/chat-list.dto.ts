/* eslint-disable prettier/prettier */
import { ListQueryDto } from '@/shared-dto/list-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatListDto extends ListQueryDto {
    @ApiProperty({ 
        description: 'Filter by user level: -1 for all, -2 for group chats only, 0=admin, 1=staff, 2=member',
        required: false,
        example: -1
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    userLevel?: number;
}
