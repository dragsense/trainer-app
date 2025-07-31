/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({ 
    example: 'General Chat', 
    description: 'Name of the chat (optional for single chats)', 
    required: false 
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: [1, 2, 3], 
    description: 'Array of user IDs to be added to the chat',
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Type(() => Number)
  userIds: number[];
}
