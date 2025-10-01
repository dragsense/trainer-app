import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  DataSource,
  Repository,
  UpdateEvent
} from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Billing } from 'shared/entities';
import { UsersService } from '@/modules/v1/users/users.service';
import { EBillingStatus, EBillingType, EPaymentMethodType } from 'shared/enums';
import { Profile } from 'shared/entities';
import { StripeInvoiceService } from '@/modules/v1/stripe/services/stripe-invoice.service';
import Stripe from 'stripe';
import { StripeBillingService } from '@/modules/v1/stripe/services/stripe-billing.service';

@EventSubscriber()
@Injectable()
export class BillingSubscriber implements EntitySubscriberInterface<Billing> {
  private readonly logger = new Logger(BillingSubscriber.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
    private readonly stripeInvoiceService: StripeInvoiceService,
    private readonly stripeBillingService: StripeBillingService,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return Billing;
  }

  async afterInsert(event: InsertEvent<Billing>) {
    try {
      // Get billing with user relations
      const billingWithRelations = await event.manager
        .getRepository(Billing)
        .findOne({
          where: { id: event.entity.id },
          relations: ['user', 'user.profile', 'paymentMethod']
        });

      if (!billingWithRelations || !billingWithRelations.user.email) {
        this.logger.warn('No email found for user, skipping email');
        return;
      }

      // Use setImmediate for better async handling
      setImmediate(async () => {
        try {
          await this.createStripeInvoice(billingWithRelations);
          await this.sendBillingEmail(billingWithRelations);
        } catch (error) {
          this.logger.error('Failed to process billing after insert:', error);
        }
      });
    } catch (error) {
      this.logger.error('Failed to send billing email:', error);
      // Don't throw error to avoid affecting the transaction
    }
  }

  async afterUpdate(event: UpdateEvent<Billing>) {
    try {

      if (!event.entity?.id) return

      // Only trigger if status changed to 'paid'
      const newStatus = event.entity.status;
      const oldStatus = event.databaseEntity.status;

      if (newStatus === EBillingStatus.PAID && oldStatus !== EBillingStatus.PAID) {
        const billing = await event.manager.getRepository(Billing).findOne({
          where: { id: event.entity.id },
          relations: ['user']
        });

        if (!billing) {
          this.logger.warn(`Billing with ID ${event.entity.id} not found`);
          return;
        }

        if (!billing.stripeInvoiceId) {
          this.logger.warn(`No Stripe invoice for billing ID ${billing.id}`);
          return;
        }


        await this.stripeInvoiceService.payInvoice(billing.stripeInvoiceId, {
          paid_out_of_band: true
        });



        this.logger.log(`Billing ID ${billing.id} marked as paid and Stripe invoice paid.`);
      }


      const billingWithRelations = await event.manager
        .getRepository(Billing)
        .findOne({
          where: { id: event.entity.id },
          relations: ['user', 'user.profile', 'paymentMethod']
        });

      if (!billingWithRelations || !billingWithRelations.user.email) {
        this.logger.warn('No email found for user, skipping email');
        return;
      }

      await this.sendBillingEmail(billingWithRelations);

    } catch (error) {
      this.logger.error(`Failed in afterUpdate for billing ID ${event.entity?.id}:`, error.message);
      // Do not rethrow — avoid affecting DB transaction
    }
  }

  private async createStripeInvoice(newBilling: Billing) {

    const user = newBilling.user;
    if (!user) {
      throw new Error('User not found');
    }

    let userStripeCustomerId = user.stripeCustomerId;
    if (!userStripeCustomerId) {
      userStripeCustomerId = await this.stripeBillingService.createOrGetStripeCustomer(user);
    }
    this.logger.log(`User Stripe customer ID: ${userStripeCustomerId}`);

    let lineItems = newBilling.lineItems.map(lineItem => {
      return {
        amount: lineItem.amount,
        currency: newBilling.currency,
        quantity: lineItem.quantity,
        description: lineItem.description || `${newBilling.localInvoiceNumber} - ${newBilling.dueDate.toLocaleDateString()}`
      }
    })

    let dueDateObj = new Date(newBilling.dueDate);

    if (isNaN(dueDateObj.getTime()) || dueDateObj <= new Date()) {
      dueDateObj = new Date();
      dueDateObj.setDate(dueDateObj.getDate() + 1);
    }

    const dueDateTimestamp = Math.floor(dueDateObj.getTime() / 1000);

    const invoice = await this.stripeInvoiceService.createInvoice(
      userStripeCustomerId,
      lineItems,
      {
        billingId: newBilling.id.toString(),
        userId: user.id.toString(),
        currency: newBilling.currency,
        type: newBilling.type,
      },
      Math.floor(dueDateTimestamp),
      false,
      {
        ...(newBilling.status === EBillingStatus.PAID ? { paid_out_of_band: true } : {})
      }
    );

    await this.dataSource.manager.update(Billing, { id: newBilling.id }, {
      stripeInvoiceId: invoice.id
    })

    this.logger.log(`✅ Successfully created invoice ${invoice.id}, user ${user.profile?.firstName} ${user.profile?.lastName}`);

  }

  private async sendBillingEmail(billing: Billing): Promise<void> {
    const user = billing.user;

    // Get admin contact information
    const adminContact = await this.getAdminContactInfo();

    await this.mailerService.sendMail({
      to: user.email,
      subject: `FORMANCE - Billing Details ${billing.stripeInvoiceId ? `(Invoice: ${billing.stripeInvoiceId})` : ''}`,
      html: this.generateBillingEmailHTML(billing, user, adminContact),
    });

  }

  private generateBillingEmailHTML(
    billing: Billing,
    user: any,
    adminContact: any
  ): string {

    const userName = user.profile?.firstName || 'Member';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FORMANCE - Billing Details</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">FORMANCE</h1>
              <h2 style="color: #d1fae5; margin: 10px 0 0 0; font-size: 20px; font-weight: 400;">Billing Details</h2>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Dear ${userName},</h3>
                <p style="color: #4b5563; line-height: 1.6; margin: 0;">Thank you for choosing FORMANCE! Below are your billing details:</p>
              </div>
              
              <!-- Invoice Details -->
              <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                <h3 style="color: #065f46; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📋 Invoice Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 30%;">Invoice ID:</td>
                    <td style="padding: 12px 0; color: #1f2937;">${billing.localInvoiceNumber}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0; font-weight: 600; color: #374151;">Date Created:</td>
                    <td style="padding: 12px 0; color: #1f2937;">${new Date(billing.createdAt).toLocaleDateString()}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0; font-weight: 600; color: #374151;">Due Date:</td>
                    <td style="padding: 12px 0; color: #1f2937;">${billing?.dueDate || 'N/A'}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0; font-weight: 600; color: #374151;">Payment Method:</td>
                    <td style="padding: 12px 0; color: #1f2937;">${billing.paymentMethod?.key === EPaymentMethodType.CASH ? 'Cash Payment' : 'Online Payment (Stripe)'}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0; font-weight: 600; color: #374151;">Invoice Amount:</td>
                    <td style="padding: 12px 0; color: #dc2626; font-weight: 700; font-size: 18px;">$${(billing?.invoiceAmount / 100)}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0; font-weight: 600; color: #374151;">Amount Due:</td>
                    <td style="padding: 12px 0; color: #dc2626; font-weight: 700; font-size: 18px;">$${(billing?.dueAmount / 100)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-weight: 600; color: #374151;">Currency:</td>
                    <td style="padding: 12px 0; color: #1f2937;">${billing?.currency?.toUpperCase() || 'USD'}</td>
                  </tr>
                </table>
              </div>

              <!-- Invoice Items -->
              ${billing?.lineItems ? `
              <div style="background: #ffffff; padding: 24px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📝 Invoice Items</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #f8fafc;">
                      <th style="padding: 12px 8px; text-align: left; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Description</th>
                      <th style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Quantity</th>
                      <th style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Amount</th>
                      <th style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Tax</th>
                      <th style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${billing.lineItems.map((item: any) => `
                      <tr>
                        <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${item.description || 'Membership Fee'}</td>
                        <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${item.quantity || 1}</td>
                        <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #f3f4f6; color: #1f2937;">$${(item.amount)} cents</td>
                        <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #f3f4f6; color: #1f2937;">$${(item.tax)}</td>
                        <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #f3f4f6; color: #1f2937;">$${(item.discount)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                  <tfoot>
                    <tr style="background: #f8fafc;">
                      <td colspan="4" style="padding: 12px 8px; text-align: right; font-weight: 700; color: #374151;">Total:</td>
                      <td style="padding: 12px 8px; text-align: right; font-weight: 700; color: #dc2626; font-size: 18px;">$${(billing.totalAmount / 100)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              ` : ''}

              <!-- Session Details -->
              ${billing.type === EBillingType.SESSION ? `
              <div style="background: #fef3c7; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">🏋️ Training Session</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #fbbf24;">
                    <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 30%;">Session Type:</td>
                    <td style="padding: 12px 0; color: #1f2937;">Personal Training</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #fbbf24;">
                    <td style="padding: 12px 0; font-weight: 600; color: #374151;">Duration:</td>
                    <td style="padding: 12px 0; color: #1f2937;">60 minutes</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-weight: 600; color: #374151;">Trainer:</td>
                    <td style="padding: 12px 0; color: #1f2937;">Will be assigned</td>
                  </tr>
                </table>
              </div>
              ` : ''}

              <!-- Billing Information -->
              <div style="background: #eff6ff; padding: 24px; border-radius: 12px; margin-bottom: 32px; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">💳 Billing Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #93c5fd;">
                    <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 30%;">Billing ID:</td>
                    <td style="padding: 12px 0; color: #1f2937;">#${billing.id}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #93c5fd;">
                    <td style="padding: 12px 0; font-weight: 600; color: #374151;">Billing Type:</td>
                    <td style="padding: 12px 0; color: #1f2937;">${billing.type}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #93c5fd;">
                    <td style="padding: 12px 0; font-weight: 600; color: #374151;">Created Date:</td>
                    <td style="padding: 12px 0; color: #1f2937;">${new Date(billing.createdAt).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-weight: 600; color: #374151;">Status:</td>
                    <td style="padding: 12px 0; color: ${billing.status === 'paid' ? '#059669' : '#f59e0b'}; font-weight: 700;">
                      ${billing.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Contact Information -->
            <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">Questions? Contact us:</p>
              <p style="color: #4b5563; font-size: 14px; margin: 0 0 8px 0;">📧 ${adminContact.email} | 📞 ${adminContact.phone}</p>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px 0;">${adminContact.address}</p>
              <p style="color: #374151; font-weight: 600; margin: 0;">Best regards,<br>The FORMANCE Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private async getAdminContactInfo() {
    try {
      // Get admin user (level 0) with profile
      const adminUser = await this.usersService.findOne({ level: 0 }, { relations: ['profile'] });

      if (adminUser) {

        return {
          email: adminUser.email,
          phone: adminUser.profile?.phoneNumber || '(555) 123-4567',
          address: this.formatAddress(adminUser.profile),
        };
      }
    } catch (error) {
      console.error('Failed to get admin contact info:', error);
    }

    // Fallback contact info if admin not found
    return {
      email: 'support@redstrength.com',
      phone: '(555) 123-4567',
      address: '123 Fitness Street, Gym City, GC 12345',
    };
  }

  private formatAddress(profile: Profile | null | undefined): string {
    if (!profile) {
      return '123 Fitness Street, Gym City, GC 12345';
    }

    const parts: string[] = [];
    if (profile.address) parts.push(profile.address);

    return parts.length > 0 ? parts.join(', ') : '123 Fitness Street, Gym City, GC 12345';
  }



} 