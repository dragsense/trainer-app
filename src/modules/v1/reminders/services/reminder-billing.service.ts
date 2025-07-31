import { Injectable, Logger } from '@nestjs/common';
import { Reminder } from '../entities/reminder.entity';
import { BillingsService } from '../../billings/billings.service';
import { use } from 'passport';
import { Repository } from 'typeorm';
import { Billing } from '../../billings/entities/billing.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BillingStatus } from '../../billings/enums/billing.enum';
import { StripeBillingService } from '../../stripe/services/stripe-billing.service';
import { StripeInvoiceService } from '../../stripe/services/stripe-invoice.service';

@Injectable()
export class ReminderBillingService {
    private readonly logger = new Logger(ReminderBillingService.name);


    constructor(
        @InjectRepository(Billing)
        private readonly billingRepository: Repository<Billing>,
        private readonly stripeBillingService: StripeBillingService,
        private readonly stripeInvoiceService: StripeInvoiceService,
    ) {
    }


    async createReminderBilling(reminder: Reminder): Promise<void> {
        if (!reminder.billing) {
            throw new Error('Billing information not found');
        }

        this.logger.log(`Creating new billing reminder for billing ID: ${reminder.billing.id}`);

        const existingBilling = await this.billingRepository.findOne({
            where: { id: reminder.billing.id },
        });
        if (!existingBilling) {
            this.logger.log(`Billing with ID ${reminder.billing.id} not found. Creating new billing...`);
        }
        else {
            this.logger.log(`Billing with ID ${reminder.billing.id} already exists. Updating reminder...`);

            const dueDate = new Date(existingBilling.dueDate);
            dueDate.setDate(dueDate.getDate() + 30);
            this.logger.log(`Due date calculated: ${dueDate.toISOString()}`);

              const localInvoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;


            const cloned = this.billingRepository.create({
                ...existingBilling,
                id: undefined,
                dueDate,
                localInvoiceNumber,
                status: BillingStatus.PENDING
            });

            const newBilling = await this.billingRepository.save(cloned);
            this.logger.log(`New billing created with ID: ${newBilling.id}`);

            if (newBilling.stripeInvoiceId) {
                this.logger.log(`Stripe invoice ID found: ${newBilling.stripeInvoiceId}`);
                const user = newBilling.user;
                if (!user) {
                    throw new Error('User not found');
                }

                let userStripeCustomerId = user.stripeCustomerId;
                if (!userStripeCustomerId) {
                    userStripeCustomerId = await this.stripeBillingService.createOrGetStripeCustomer(user);
                }
                this.logger.log(`User Stripe customer ID: ${userStripeCustomerId}`);

                // Create invoice using StripeInvoiceService
                const invoice = await this.stripeInvoiceService.createInvoice(
                    userStripeCustomerId,
                    [{
                        amount: existingBilling.totalAmount,
                        currency: existingBilling.currency,
                        quantity: 1,
                        description: `${newBilling.localInvoiceNumber} - ${newBilling.dueDate.toLocaleDateString()}`
                    }],
                    {
                        billingId: newBilling.id.toString(),
                        userId: user.id.toString(),
                        currency: existingBilling.currency,
                        type: existingBilling.type,
                    },
                    Math.floor(dueDate.getTime() / 1000),
                    false,
                );

                this.logger.log(`✅ Successfully created invoice ${invoice.id}, user ${user.profile?.firstName} ${user.profile?.lastName}`);


            }
        }
    }
}
