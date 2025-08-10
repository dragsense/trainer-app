import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Length } from 'class-validator';

export class CreateStripeConnectDto {

  @ApiProperty({ example: 'express', description: 'Account type' })
  @IsEnum(['express', 'standard'], { message: 'type must be either express or standard' })
  type: 'express' | 'standard';

  @ApiProperty({ example: 'US', description: 'Account country' })
  @IsString()
  @Length(2, 2, { message: 'country must be a 2-letter ISO code' })
  country: string;

}
