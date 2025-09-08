import { Controller, Post, Headers, RawBody, BadRequestException, Logger } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(private readonly stripeService: StripeService) { }

  @Post('webhook')
  async handleWebhook(
    @RawBody() payload: Buffer,
    @Headers('stripe-signature') signature: string
  ) {
    this.logger.log('Received Stripe webhook request');

    if (!payload) {
      this.logger.error('No payload received in webhook');
      throw new BadRequestException('No payload received in webhook');
    }

    if (!signature) {
      this.logger.error('No Stripe signature received in webhook');
      throw new BadRequestException('No Stripe signature received in webhook');
    }

    this.logger.debug(`Webhook payload size: ${payload.length} bytes, signature: ${signature.substring(0, 20)}...`);

    try {
      const event = await this.stripeService.handleWebhook(payload, signature);

      this.logger.log(`Successfully processed Stripe webhook event: ${event.type} (ID: ${event.id})`);

      return { received: true };
    } catch (error) {
      this.logger.error(`Failed to process Stripe webhook: ${error.message}`);
      this.logger.error('Webhook error details:', error);
      throw new BadRequestException(error.message);
    }
  }

}
