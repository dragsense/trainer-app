import { Injectable, Logger } from '@nestjs/common';
import { Reminder } from 'shared/entities';
import { BillingsService } from '../../billings/billings.service';
import { use } from 'passport';
import { Repository } from 'typeorm';
import { Billing } from 'shared/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { EBillingStatus } from 'shared/enums';

@Injectable()
export class ReminderBillingService {
    private readonly logger = new Logger(ReminderBillingService.name);


    constructor(
        @InjectRepository(Billing)
        private readonly billingRepository: Repository<Billing>,
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
                status: EBillingStatus.PENDING
            });

            const newBilling = await this.billingRepository.save(cloned);
            this.logger.log(`New billing created with ID: ${newBilling.id}`);
        }
    }
}
