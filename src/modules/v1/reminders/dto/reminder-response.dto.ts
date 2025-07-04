import { ApiProperty } from '@nestjs/swagger';
import { Reminder } from '../entities/reminder.entity';

export class ReminderResponseDto {
  @ApiProperty({
    description: 'The reminder',
    type: Reminder,
  })
  reminder: Reminder;

  @ApiProperty({
    description: 'Message describing the operation result',
    example: 'Reminder created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Any additional metadata',
    example: { scheduledAt: '2025-07-01T06:49:35+05:00' },
  })
  metadata?: Record<string, any>;
}
