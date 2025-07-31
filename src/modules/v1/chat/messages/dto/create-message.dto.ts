/* eslint-disable prettier/prettier */
import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ example: 1, description: 'ID of the sender' })
  @IsInt()
  senderId: number;

  @ApiProperty({ example: 'Hello there!', description: 'Content of the message' })
  @IsString()
  content: string;

}
