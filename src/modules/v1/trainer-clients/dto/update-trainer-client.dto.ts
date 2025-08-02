import { PartialType } from '@nestjs/mapped-types';
import { CreateTrainerClientDto } from './create-trainer-client.dto';

export class UpdateTrainerClientDto extends PartialType(CreateTrainerClientDto) {}
