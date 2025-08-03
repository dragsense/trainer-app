import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @ApiPropertyOptional({
        example: 'acct_1234567890',
        description: 'Stripe Connect account ID for trainers'
    })
    @IsOptional()
    @IsString()
    stripeConnectAccountId?: string | null;

}

