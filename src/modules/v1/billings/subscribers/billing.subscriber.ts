import { 
  EntitySubscriberInterface, 
  EventSubscriber, 
  InsertEvent,
  DataSource 
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Billing } from '../entities/billing.entity';
import { UsersService } from '@/modules/v1/users/users.service';
import {  BillingType } from '../enums/billing.enum';
import { Profile } from '@/modules/v1/users/profiles/entities/profile.entity';
import { StripeInvoiceService } from '@/modules/v1/stripe/services/stripe-invoice.service';
import Stripe from 'stripe';

@EventSubscriber()
@Injectable()
export class BillingSubscriber implements EntitySubscriberInterface<Billing> {
  constructor(
    private readonly mailerService: MailerService,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
    private readonly stripInvoiceServices: StripeInvoiceService
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
          relations: ['user', 'user.profile']
        });

      if (!billingWithRelations || !billingWithRelations.user.email) {
        console.log('No email found for user, skipping email');
        return;
      }

      await this.sendBillingEmail(billingWithRelations);
    } catch (error) {
      console.error('Failed to send billing email:', error);
      // Don't throw error to avoid affecting the transaction
    }
  }

  private async sendBillingEmail(billing: Billing): Promise<void> {
    const user = billing.user;
    
    // Get admin contact information
    const adminContact = await this.getAdminContactInfo();

    // Get Stripe invoice details if available
    let stripeInvoiceDetails: Stripe.Invoice | null = null;
    if (billing.stripeInvoiceId) {
      try {
        stripeInvoiceDetails = await this.stripInvoiceServices.getInvoice(billing.stripeInvoiceId);
      } catch (error) {
        console.error('Failed to fetch Stripe invoice details:', error);
      }
    }

    await this.mailerService.sendMail({
      to: user.email,
      subject: `Red Strength - Billing Details ${billing.stripeInvoiceId ? `(Invoice: ${billing.stripeInvoiceId})` : ''}`,
      html: this.generateBillingEmailHTML(billing, user, adminContact, stripeInvoiceDetails),
    });

    console.log(`Billing email sent to ${user.email} for billing #${billing.id}`);
  }

  private generateBillingEmailHTML(
    billing: Billing, 
    user: any, 
    adminContact: any, 
    stripeInvoice: any
  ): string {

    if(!stripeInvoice)
      return 'No invoice found';


    const userName = user.profile?.firstName || 'Member';
    const isManualPayment = stripeInvoice.metadata?.isManualPayment === 'true' || stripeInvoice.metadata?.paymentMethod === 'cash';
    const paymentMethod = stripeInvoice.metadata?.paymentMethod || 'stripe';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #c8102e; margin-bottom: 10px;">Red Strength Gym</h1>
          <h2 style="color: #333; margin: 0;">Billing Details</h2>
        </div>
        
        <p>Dear ${userName},</p>
        
        <p>Thank you for choosing Red Strength! Below are your billing details:</p>
        
        <!-- Stripe Invoice Details -->
        ${billing.stripeInvoiceId ? `
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #c8102e; margin-top: 0;">📋 Invoice Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Stripe Invoice ID:</td>
              <td style="padding: 8px 0;">${billing.stripeInvoiceId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Invoice Number:</td>
              <td style="padding: 8px 0;">${stripeInvoice?.number || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Date Created:</td>
              <td style="padding: 8px 0;">${new Date(billing.createdAt).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Due Date:</td>
              <td style="padding: 8px 0;">${stripeInvoice?.due_date ? new Date(stripeInvoice.due_date * 1000).toLocaleDateString() : 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Payment Method:</td>
              <td style="padding: 8px 0;">${paymentMethod === 'cash' ? 'Cash Payment' : 'Online Payment (Stripe)'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Amount Due:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #c8102e;">$${(stripeInvoice?.amount_due / 100).toFixed(2) || stripeInvoice.amount || '0.00'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Currency:</td>
              <td style="padding: 8px 0;">${stripeInvoice?.currency?.toUpperCase() || 'USD'}</td>
            </tr>
          </table>
        </div>
        ` : ''}

        <!-- Invoice Items -->
        ${stripeInvoice?.lines?.data ? `
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd;">
          <h3 style="color: #333; margin-top: 0;">📝 Invoice Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 1px solid #ddd;">Description</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">Quantity</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${stripeInvoice.lines.data.map((item: any) => `
                <tr>
                  <td style="padding: 12px 8px; border-bottom: 1px solid #eee;">${item.description || 'Membership Fee'}</td>
                  <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #eee;">${item.quantity || 1}</td>
                  <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #eee;">$${(item.amount / 100).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background: #f9f9f9;">
                <td colspan="2" style="padding: 12px 8px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #c8102e;">$${(stripeInvoice.amount_due / 100).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        ` : ''}

        <!-- Membership Details -->
    
        <!-- Session Details -->
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
        ` : ''}

        <!-- Billing Details -->
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e4d72; margin-top: 0;">💳 Billing Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Billing ID:</td>
              <td style="padding: 8px 0;">#${billing.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Billing Type:</td>
              <td style="padding: 8px 0;">${billing.type}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Created Date:</td>
              <td style="padding: 8px 0;">${new Date(billing.createdAt).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Status:</td>
              <td style="padding: 8px 0; color: ${stripeInvoice.status === 'paid' ? '#28a745' : '#ffc107'}; font-weight: bold;">
                ${stripeInvoice.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
              </td>
            </tr>
          </table>
        </div>

        <!-- Payment Instructions -->
        <div style="background: ${isManualPayment ? '#fff3cd' : '#d4edda'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isManualPayment ? '#ffc107' : '#28a745'};">
          <h3 style="color: ${isManualPayment ? '#856404' : '#155724'}; margin-top: 0;">
            ${isManualPayment ? '💵 Cash Payment Instructions' : '💳 Online Payment Instructions'}
          </h3>
          <p style="margin: 0; color: ${isManualPayment ? '#856404' : '#155724'};">
            ${isManualPayment 
              ? 'Please visit our facility to complete your cash payment. Bring this invoice with you for reference. Payment is due within 3 days.'
              : 'Please complete your online payment using the link provided in your Stripe invoice. Your membership will be activated once payment is confirmed.'
            }
          </p>
          ${!isManualPayment && stripeInvoice?.hosted_invoice_url ? `
          <div style="margin-top: 15px;">
            <a href="${stripeInvoice.hosted_invoice_url}" 
               style="background: #c8102e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Pay Now
            </a>
          </div>
          ` : ''}
        </div>

        <!-- Contact Information -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 5px 0;">Questions? Contact us:</p>
          <p style="margin: 5px 0;">📧 ${adminContact.email} | 📞 ${adminContact.phone}</p>
          <p style="margin: 5px 0; color: #666;">${adminContact.address}</p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #c8102e; font-weight: bold;">Best regards,<br>The Red Strength Team</p>
        </div>
      </div>
    `;
  }

  private async getAdminContactInfo() {
    try {
      // Get admin user (level 0) with profile
      const adminUser = await this.usersService.findOne({level: 0}, { relations: ['profile'] });

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