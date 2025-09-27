import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from 'shared/entities';
import { EPaymentMethodType, PAYMENT_METHOD_CONFIGS } from 'shared/enums';

@Injectable()
export class PaymentMethodsSeeder {
  private readonly logger = new Logger(PaymentMethodsSeeder.name);

  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
    private readonly configService: ConfigService,
  ) { }

  async seed() {
    const existingMethods = await this.paymentMethodRepo.find();
    const existingKeys = new Set(existingMethods.map(m => m.key));

    const toSave: PaymentMethod[] = [];

    for (const type of Object.values(EPaymentMethodType)) {
      const config = PAYMENT_METHOD_CONFIGS[type];
      let isEnabled = type === EPaymentMethodType.CASH;

      let initialConfig: Record<string, any> | null = null;

      if (type === EPaymentMethodType.STRIPE) {
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


      if (existingKeys.has(type)) continue;

      // Create new method
      const method = this.paymentMethodRepo.create({
        key: type,
        name: config.name,
        configSchema: config.configSchema,
        isEnabled,
        config: initialConfig,
      });
      toSave.push(method);

    }

    if (toSave.length > 0) {
      await this.paymentMethodRepo.save(toSave);
      this.logger.log(`✅ Seeded  ${toSave.length} payment methods`);
    } else {
      this.logger.log('✅ Payment methods already seeded and up to date, skipping...');
    }
  }
} 