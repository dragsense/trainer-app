import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  DataSource,
  Repository
} from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'shared/entities';
import { BillingsService } from '@/modules/v1/billings/billings.service';
import { EBillingCurrency, EBillingStatus, EBillingType } from 'shared/enums';
import { CreateBillingDto } from 'shared/dtos';
import { User } from 'shared/entities';
import { Billing } from 'shared/entities';

@EventSubscriber()
@Injectable()
export class SessionSubscriber implements EntitySubscriberInterface<Session> {
  private readonly logger = new Logger(SessionSubscriber.name);

  constructor(
    private readonly dataSource: DataSource,
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
            'creator',
            'creator.profile'
          ]
        }); 

      if (!sessionWithRelations) {
        this.logger.error(`❌ Session not found after creation: ${event.entity.id}`);
        return;
      }
      console.log(`Session with all relations: ${JSON.stringify(sessionWithRelations, null, 2)}`);

      // Use setTimeout to ensure the session is fully saved
      setTimeout(() => {
        this.generateSingleSessionInvoice(sessionWithRelations);
      }, 100);

    } catch (error) {
      this.logger.error(`❌ Failed to generate session invoices: ${error.message}`, error.stack);
      // Don't throw error to avoid affecting the transaction
    }
  }


  private async generateSingleSessionInvoice(session: Session): Promise<void> {
    const { clients } = session;

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


        await this.createBillingRecord(session, dueDate, client);

      } catch (error) {
        this.logger.error(`❌ Failed to generate invoice for session ${session.id}, client ${client.profile?.firstName || client.id}: ${error.message}`);
        // Continue with other clients even if one fails
      }
    }



  }

  private async createBillingRecord(session: Session, dueDate: Date, user: User): Promise<Billing> {

    const createBillingDto: CreateBillingDto = {
      user: { id: user.id, email: user.email },
      sessionId: session.id,
      type: EBillingType.SESSION,
      status: EBillingStatus.PENDING,
      currency: session.currency as EBillingCurrency || EBillingCurrency.USD,
      issueDate: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
      paymentMethodType: session.paymentMethodType,
      
          discount: 0,
      lineItems: [
        {
          description: session.description || ('Session Item' + session.id),
          amount: session.pricePerClient || 0,
          quantity: 1,
          tax: 0,
          unitPrice: session.pricePerClient || 0,
        },
      ],
    };

    const billing = await this.billingsService.create(createBillingDto, session.creator);
    this.logger.log(`✅ Successfully created billing record for session ${session.id}, client ${user.email}: ${billing.id}`);
    return billing;
  }
} 