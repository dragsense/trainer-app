import { PartialType } from '@nestjs/swagger';
import { CreateUserAvailabilityDto } from './create-user-availability.dto';

export class UpdateUserAvailabilityDto extends PartialType(CreateUserAvailabilityDto) {

}
