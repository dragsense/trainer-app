import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  DataSource,
  Repository
} from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from '../entities/session.entity';
import { StripeBillingService } from '@/modules/v1/stripe/services/stripe-billing.service';
import { StripeInvoiceService } from '@/modules/v1/stripe/services/stripe-invoice.service';
import { SessionStatus, SessionType } from '../enums/session.enum';
import { BillingsService } from '@/modules/v1/billings/billings.service';
import { BillingCurrency, BillingStatus, BillingType } from '../../billings/enums/billing.enum';
import { CreateBillingDto } from '../../billings/dto/create-billing.dto';
import { User } from '../../users/entities/user.entity';
import { Billing } from '../../billings/entities/billing.entity';

@EventSubscriber()
@Injectable()
export class SessionSubscriber implements EntitySubscriberInterface<Session> {
  private readonly logger = new Logger(SessionSubscriber.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly stripeBillingService: StripeBillingService,
    private readonly stripeInvoiceService: StripeInvoiceService,
    private readonly billingsService: BillingsService,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return Session;
  }

  async afterInsert(event: InsertEvent<Session>) {
    try {
      this.logger.log(`🎯 SessionSubscriber.afterInsert triggered for session ID: ${event.entity.id}`);
      this.logger.log(`Session data: ${JSON.stringify(event.entity, null, 2)}`);

      // Get session with all relations including profiles
      const sessionWithRelations = await event.manager
        .getRepository(Session)
        .findOne({
          where: { id: event.entity.id },
          relations: [
            'trainer',
            'trainer.profile',
            'clients',
            'clients.profile',
            'createdBy',
            'createdBy.profile'
          ]
        });

      if (!sessionWithRelations) {
        this.logger.error(`❌ Session not found after creation: ${event.entity.id}`);
        return;
      }

      // Use setTimeout to ensure the session is fully saved
      setTimeout(() => {
        this.generateSessionInvoices(sessionWithRelations);
      }, 100);

    } catch (error) {
      this.logger.error(`❌ Failed to generate session invoices: ${error.message}`, error.stack);
      // Don't throw error to avoid affecting the transaction
    }
  }

  private async generateSessionInvoices(session: Session): Promise<void> {
    const { trainer, clients } = session;

    if (!clients || clients.length === 0) {
      this.logger.warn(`No clients found for session ${session.id}`);
      return;
    }

    // Ensure trainer has Stripe customer
    if (trainer && trainer.profile) {
      this.logger.log(`Creating/getting Stripe customer for trainer: ${trainer.profile.firstName} ${trainer.profile.lastName} (${trainer.email})`);
      const trainerStripeCustomerId = await this.stripeBillingService.createOrGetStripeCustomer(trainer);
      this.logger.log(`Trainer Stripe customer ID: ${trainerStripeCustomerId}`);
    }

    // Ensure all clients have Stripe customers and collect their IDs
    const clientStripeCustomerIds = new Map<number, string>();

    for (const client of clients) {
      if (client.profile) {
        this.logger.log(`Creating/getting Stripe customer for client: ${client.profile.firstName} ${client.profile.lastName} (${client.email})`);
        const clientStripeCustomerId = await this.stripeBillingService.createOrGetStripeCustomer(client);
        clientStripeCustomerIds.set(client.id, clientStripeCustomerId);
        this.logger.log(`Client ${client.profile.firstName} ${client.profile.lastName} Stripe customer ID: ${clientStripeCustomerId}`);
      } else {
        this.logger.error(`Client ${client.id} has no profile, skipping Stripe customer creation`);
      }
    }


    await this.generateSingleSessionInvoice(session, clientStripeCustomerIds);

  }

  private async generateSingleSessionInvoice(session: Session, clientStripeCustomerIds: Map<number, string>): Promise<void> {
    const { clients, trainer, pricePerClient, currency = 'USD' } = session;

    for (const client of clients) {
      try {
        if (!client.profile) {
          this.logger.error(`Client ${client.id} has no profile, skipping invoice generation`);
          continue;
        }
        this.logger.log(`Processing invoice for client: ${client.profile.firstName} ${client.profile.lastName} (${client.email})`);



        // Calculate due date (30 days from now)
        const dueDate = new Date(session.dateTime);
        dueDate.setDate(dueDate.getDate() + 30);
        this.logger.log(`Due date calculated: ${dueDate.toISOString()}`);


        const billing = await this.createBillingRecord(session, dueDate, client);


        const clientStripeCustomerId = clientStripeCustomerIds.get(client.id);
        if (!clientStripeCustomerId) {
          this.logger.error(`No Stripe customer ID found for client ${client.id}, skipping invoice generation`);
          continue;
        }

        this.logger.log(`Generating invoice for client: ${client.profile.firstName} ${client.profile.lastName} (${client.email})`);



        const price = pricePerClient || 0;
        if (price <= 0) {
          this.logger.warn(`No valid price found for session ${session.id}, client ${client.profile.firstName} ${client.profile.lastName}`);
          continue;
        }

        this.logger.log(`Creating invoice with price: ${price} ${currency} for session: ${session.title}`);


        // Create invoice using StripeInvoiceService
        const invoice = await this.stripeInvoiceService.createInvoice(
          clientStripeCustomerId,
          [{
            amount: price,
            currency: currency,
            quantity: 1,
            description: `${session.title} - ${session.dateTime.toLocaleDateString()} ${session.dateTime.toLocaleTimeString()}`
          }],
          {
            billingId: billing.id.toString(),
            sessionId: session.id.toString(),
            clientId: client.id.toString(),
            trainerId: trainer?.id?.toString() || '',
            sessionType: session.type,
            pricePerClient: price.toString(),
            currency: currency,
            type: BillingType.SESSION,
          },
          Math.floor(dueDate.getTime() / 1000),
          false,
        );

        this.logger.log(`✅ Successfully created invoice ${invoice.id} for session ${session.id}, client ${client.profile.firstName} ${client.profile.lastName}`);


      } catch (error) {
        this.logger.error(`❌ Failed to generate invoice for session ${session.id}, client ${client.profile?.firstName || client.id}: ${error.message}`);
        // Continue with other clients even if one fails
      }
    }
  }

  private async createBillingRecord(session: Session, dueDate, user: User): Promise<Billing> {




    const createBillingDto: CreateBillingDto = {
      userId: user.id,
      sessionId: session.id,
      type: BillingType.SESSION,
      status: BillingStatus.PENDING,
      invoiceAmount: session.pricePerClient || 0,
      currency: session.currency as BillingCurrency || BillingCurrency.USD,
      issueDate: new Date().toISOString(),
      dueDate,
      lineItems: [
        {
          description: session.description || '',
          amount: session.pricePerClient || 0,
          quantity: 1,
          tax: 0,
          unitPrice: session.pricePerClient || 0,
        },
      ],
    };

    const billing = await this.billingsService.create(createBillingDto, user);
    this.logger.log(`✅ Successfully created billing record for session ${session.id}, client ${user.email}: ${billing.id}`);
    return billing;
  }
} 