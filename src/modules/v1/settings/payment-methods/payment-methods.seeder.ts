import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentMethodType, PAYMENT_METHOD_CONFIGS } from './enums/payment-method-type.enum';
import { SettingsCommonStatus } from '../common-enums/settings-common.enum';

@Injectable()
export class PaymentMethodsSeeder {
  private readonly logger = new Logger(PaymentMethodsSeeder.name);

  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
    private readonly configService: ConfigService,
  ) {}

  async seed() {
    const existingMethods = await this.paymentMethodRepo.find();
    
    if (existingMethods.length > 0) {
      this.logger.log('Payment methods already seeded, skipping...');
      return;
    }

    const paymentMethods = Object.values(PaymentMethodType).map(type => {
      const config = PAYMENT_METHOD_CONFIGS[type];
      let isEnabled =  type === PaymentMethodType.CASH ? true : false; 
      // For Stripe, populate config from environment variables if available
      let initialConfig: Record<string, any> | null = null;
      if (type === PaymentMethodType.STRIPE) {
        const stripeConfig = this.configService.get('stripe');
        if (stripeConfig?.secretKey && stripeConfig?.publishableKey) {
          initialConfig = {
            publishableKey: stripeConfig.publishableKey,
            secretKey: stripeConfig.secretKey,
            webhookSecret: stripeConfig.webhookSecret || null,
          };
          isEnabled = true;
        }
      }
      
      return this.paymentMethodRepo.create({
        key: type,
        name: config.name,
        configSchema: config.configSchema,
        isEnabled,
        config: initialConfig,
        status: SettingsCommonStatus.ACTIVE
      });
    });

    await this.paymentMethodRepo.save(paymentMethods);
    this.logger.log('✅ Payment methods seeded successfully');
  }
} 