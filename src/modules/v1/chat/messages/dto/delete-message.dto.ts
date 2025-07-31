/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class DeleteMessagesDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Array of message IDs to delete',
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  messageIds: number[];
}
