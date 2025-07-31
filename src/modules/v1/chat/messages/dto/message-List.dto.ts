/* eslint-disable prettier/prettier */
import { ListQueryDto } from '@/shared-dto/list-query.dto';
import { ApiProperty } from '@nestjs/swagger';

class SenderDto {
  @ApiProperty({ example: 5 })
  id: number;

  @ApiProperty({ example: 'testing@example.com' })
  email: string;

  @ApiProperty({ example: 2 })
  level: number;
}

export class MessageListDto extends ListQueryDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ type: SenderDto })
  sender: SenderDto;

  @ApiProperty({ example: 'hello this is a user!' })
  content: string;

  @ApiProperty({ example: '2025-07-02T07:52:44.654Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-07-02T07:52:44.654Z' })
  updatedAt: string;
}
