import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTrainerClientDto {
  @Type(() => Number)
  @IsInt()
  trainerId: number;

  @Type(() => Number)
  @IsInt()
  clientId: number;
}
