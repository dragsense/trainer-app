import { ApiProperty } from '@nestjs/swagger';
import { MessageResponse } from '@/interfaces/general.interface';

export class StripeConnectAccountDto {
    @ApiProperty({ example: 'acct_1234567890', description: 'Stripe account ID' })
    id: string;

    @ApiProperty({ example: 'express', description: 'Account type' })
    type: string;

    @ApiProperty({ example: 'US', description: 'Account country' })
    country: string;

    @ApiProperty({ example: 'user@example.com', description: 'Account email' })
    email: string;

    @ApiProperty({ example: true, description: 'Whether charges are enabled' })
    charges_enabled: boolean;

    @ApiProperty({ example: true, description: 'Whether details have been submitted' })
    details_submitted: boolean;
}

export class StripeConnectStatusDto {
    @ApiProperty({ example: true, description: 'Whether the account setup is complete' })
    isComplete: boolean;

    @ApiProperty({ type: StripeConnectAccountDto, nullable: true, description: 'Account details if exists' })
    account: StripeConnectAccountDto | null;

    @ApiProperty({ example: 'acct_1234567890', nullable: true, description: 'Stripe account ID' })
    stripeAccountId: string | null;
}

export class StripeConnectCreateResponseDto implements MessageResponse {
    @ApiProperty({ example: true, description: 'Success status' })
    success: boolean;

    @ApiProperty({ example: 'Stripe Connect account created successfully', description: 'Response message' })
    message: string;

    @ApiProperty({ description: 'Account creation data' })
    data: {
        accountId: string;
        onboardingUrl: string;
    };
}

export class StripeConnectDeleteResponseDto implements MessageResponse {
    @ApiProperty({ example: true, description: 'Success status' })
    success: boolean;

    @ApiProperty({ example: 'Stripe Connect account deleted successfully', description: 'Response message' })
    message: string;
}
