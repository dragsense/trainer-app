import { PartialType } from '@nestjs/swagger';
import { CreateTrainerClientDto } from './create-trainer-client.dto';

export class UpdateTrainerClientDto extends PartialType(CreateTrainerClientDto) {}
