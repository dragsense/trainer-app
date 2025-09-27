import { PartialType } from '@nestjs/swagger';
import { ListQueryDto } from "../common/list-query.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsDateString, IsString } from "class-validator";
import { PaginationMetaDto } from "../common/pagination.dto";
import { ApiProperty } from "@nestjs/swagger";
import { TrainerClient } from "../../entities/trainer-clients/trainer-client.entity";
import { ITrainerClient } from '../../interfaces/trainer-clients.interface';

export class CreateTrainerClientDto {
  @Type(() => Number)
  @IsInt()
  trainerId: number;

  @Type(() => Number)
  @IsInt()
  clientId: number;
}



export class UpdateTrainerClientDto extends PartialType(CreateTrainerClientDto) { }




export class TrainerClientListDto extends ListQueryDto<ITrainerClient> {

  @ApiPropertyOptional({
    description: 'Filter by trainer ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  trainerId?: number;

  @ApiPropertyOptional({
    description: 'Filter by client ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clientId?: number;

  @ApiPropertyOptional({
    description: 'Filter by trainer email',
    example: 'trainer@example.com',
  })
  @IsOptional()
  @IsString()
  trainerEmail?: string;

  @ApiPropertyOptional({
    description: 'Filter by client email',
    example: 'client@example.com',
  })
  @IsOptional()
  @IsString()
  clientEmail?: string;

  @ApiPropertyOptional({
    description: 'Filter by trainer first name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  trainerFirstName?: string;

  @ApiPropertyOptional({
    description: 'Filter by trainer last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  trainerLastName?: string;

  @ApiPropertyOptional({
    description: 'Filter by client first name',
    example: 'Jane',
  })
  @IsOptional()
  @IsString()
  clientFirstName?: string;

  @ApiPropertyOptional({
    description: 'Filter by client last name',
    example: 'Smith',
  })
  @IsOptional()
  @IsString()
  clientLastName?: string;

  @ApiPropertyOptional({
    description: 'Filter by assignment date (from)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  assignedDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by assignment date (to)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  assignedDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by trainer specialty',
    example: 'Weight Training',
  })
  @IsOptional()
  @IsString()
  trainerSpecialty?: string;

  @ApiPropertyOptional({
    description: 'Filter by client fitness goal',
    example: 'Weight Loss',
  })
  @IsOptional()
  @IsString()
  clientGoal?: string;
}




export class TrainerClientsPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [TrainerClient] })
  @Type(() => TrainerClient)
  data: TrainerClient[]
}