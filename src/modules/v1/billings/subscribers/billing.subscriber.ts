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
import { Billing } from '../entities/billing.entity';
import { UsersService } from '@/modules/v1/users/users.service';
import { BillingStatus, BillingType } from '../enums/billing.enum';
import { Profile } from '@/modules/v1/users/profiles/entities/profile.entity';
import { StripeInvoiceService } from '@/modules/v1/stripe/services/stripe-invoice.service';
import Stripe from 'stripe';
import { StripeBillingService } from '../../stripe/services/stripe-billing.service';

@EventSubscriber()
@Injectable()
export class BillingSubscriber implements EntitySubscriberInterface<Billing> {
  private readonly logger = new Logger(BillingSubscriber.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
    private readonly stripInvoiceServices: StripeInvoiceService,
    private readonly stripeBillingService: StripeBillingService,
    private readonly stripeInvoiceService: StripeInvoiceService,

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
        console.log('No email found for user, skipping email');
        return;
      }

      setTimeout(async () => {

        await this.createStripeInvoice(billingWithRelations)
        await this.sendBillingEmail(billingWithRelations);

      }, 100)
    } catch (error) {
      console.error('Failed to send billing email:', error);
      // Don't throw error to avoid affecting the transaction
    }
  }

  async afterUpdate(event: UpdateEvent<Billing>) {
    try {

      if (!event.entity?.id) return

      // Only trigger if status changed to 'paid'
      const newStatus = event.entity.status;
      const oldStatus = event.databaseEntity.status;

      if (newStatus === BillingStatus.PAID && oldStatus !== BillingStatus.PAID) {
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


        await this.stripInvoiceServices.payInvoice(billing.stripeInvoiceId, {
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
        console.log('No email found for user, skipping email');
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
        ...(newBilling.status === BillingStatus.PAID ? { paid_out_of_band: true } : {})
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
      subject: `Trainer App - Billing Details ${billing.stripeInvoiceId ? `(Invoice: ${billing.stripeInvoiceId})` : ''}`,
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #c8102e; margin-bottom: 10px;">Trainer App</h1>
          <h2 style="color: #333; margin: 0;">Billing Details</h2>
        </div>
        
        <p>Dear ${userName},</p>
        
        <p>Thank you for choosing Red Strength! Below are your billing details:</p>
        
        <!-- Stripe Invoice Details -->
      
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #c8102e; margin-top: 0;">📋 Invoice Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Stripe Invoice ID:</td>
              <td style="padding: 8px 0;">${billing.localInvoiceNumber}</td>
            </tr>
      
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Date Created:</td>
              <td style="padding: 8px 0;">${new Date(billing.createdAt).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Due Date:</td>
              <td style="padding: 8px 0;">${billing?.dueDate || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Payment Method:</td>
              <td style="padding: 8px 0;">${billing.paymentMethod?.key === 'cash' ? 'Cash Payment' : 'Online Payment (Stripe)'}</td>
            </tr>
              <tr>
              <td style="padding: 8px 0; font-weight: bold;">Invoice Amount:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #c8102e;">$${(billing?.invoiceAmount / 100)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Amount Due:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #c8102e;">$${(billing?.dueAmount / 100)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Currency:</td>
              <td style="padding: 8px 0;">${billing?.currency?.toUpperCase() || 'USD'}</td>
            </tr>
          </table>
        </div>
   

        <!--Invoice Items-- >
          ${billing?.lineItems ? `
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd;">
          <h3 style="color: #333; margin-top: 0;">📝 Invoice Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 1px solid #ddd;">Description</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">Quantity</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">Amount</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">Tax</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">Discount</th>

              </tr>
            </thead>
            <tbody>
              ${billing.lineItems.map((item: any) => `
                <tr>
                  <td style="padding: 12px 8px; border-bottom: 1px solid #eee;">${item.description || 'Membership Fee'}</td>
                  <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #eee;">${item.quantity || 1}</td>
                  <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #eee;">$${(item.amount)} cents</td>
                  <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #eee;">$${(item.tax)}</td>
                  <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #eee;">$${(item.discount)}</td>


                  </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background: #f9f9f9;">
                <td colspan="2" style="padding: 12px 8px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #c8102e;">$${(billing.totalAmount / 100)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        ` : ''
      }

  <!--Session Details-- >
    ${billing.type === BillingType.SESSION ? `
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">🏋️ Training Session</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Session Type:</td>
              <td style="padding: 8px 0;">Personal Training</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Duration:</td>
              <td style="padding: 8px 0;">60 minutes</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Trainer:</td>
              <td style="padding: 8px 0;">Will be assigned</td>
            </tr>
          </table>
        </div>
        ` : ''
      }

<!--Billing Details-- >
  <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;" >
    <h3 style="color: #1e4d72; margin-top: 0;" >💳 Billing Information </h3>
      < table style = "width: 100%; border-collapse: collapse;" >
        <tr>
        <td style="padding: 8px 0; font-weight: bold;" > Billing ID: </td>
          < td style = "padding: 8px 0;" > #${billing.id} </td>
            </tr>
            < tr >
            <td style="padding: 8px 0; font-weight: bold;" > Billing Type: </td>
              < td style = "padding: 8px 0;" > ${billing.type} </td>
                </tr>
                < tr >
                <td style="padding: 8px 0; font-weight: bold;" > Created Date: </td>
                  < td style = "padding: 8px 0;" > ${new Date(billing.createdAt).toLocaleDateString()} </td>
                    </tr>
                    < tr >
                    <td style="padding: 8px 0; font-weight: bold;" > Status: </td>
                      < td style = "padding: 8px 0; color: ${billing.status === 'paid' ? '#28a745' : '#ffc107'}; font-weight: bold;" >
                        ${billing.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
</td>
  </tr>
  </table>
  </div>


  < !--Contact Information-- >
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;" >
      <p style="margin: 5px 0;" > Questions ? Contact us: </p>
        < p style = "margin: 5px 0;" >📧 ${adminContact.email} | 📞 ${adminContact.phone} </p>
          < p style = "margin: 5px 0; color: #666;" > ${adminContact.address} </p>
            </div>

            < div style = "text-align: center; margin-top: 20px;" >
              <p style="color: #c8102e; font-weight: bold;" > Best regards, <br>The Red Strength Team </p>
                </div>
                </div>
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