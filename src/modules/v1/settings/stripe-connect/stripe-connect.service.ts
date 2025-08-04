import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import Stripe from 'stripe';
import { User } from '@/modules/v1/users/entities/user.entity';
import { StripeConnectAccount } from './entities/stripe-connect-account.entity';
import { CreateStripeConnectDto } from './dto/create-stripe-connect.dto';
import { StripeConnectStatusDto, StripeConnectCreateResponseDto, StripeConnectDeleteResponseDto } from './dto/stripe-connect-responses.dto';

@Injectable()
export class StripeConnectService {
  private readonly logger = new Logger(StripeConnectService.name);
  private stripe: Stripe | null = null;

  constructor(
    @InjectRepository(StripeConnectAccount)
    private stripeConnectRepository: Repository<StripeConnectAccount>,
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {
    this.initializeStripe();
  }

  private async initializeStripe() {
    try {
      this.logger.log('Initializing Stripe service...');
      const stripeConfig = await this.paymentMethodsService.getStripeConfig();

      if (stripeConfig?.secretKey) {
        this.stripe = new Stripe(stripeConfig.secretKey);
        this.logger.log('Stripe service initialized successfully');
      } else {
        this.logger.warn('Stripe not configured in payment methods settings');
        this.stripe = null;
      }
    } catch (error) {
      this.logger.error('Error initializing Stripe service:', error.message);
      this.stripe = null;
    }
  }

  private async ensureStripeInitialized() {
    if (!this.stripe) {
      await this.initializeStripe();
    }

    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured. Please configure Stripe in Payment Methods settings.');
    }
  }

  async create(user: User, createDto: CreateStripeConnectDto): Promise<StripeConnectCreateResponseDto> {
    await this.ensureStripeInitialized();

    // Check if user already has an account
    const existingAccount = await this.stripeConnectRepository.findOne({
      where: { userId: user.id }
    });

    if (existingAccount) {
      throw new BadRequestException('User already has a Stripe Connect account');
    }

    try {
      // Create Stripe Express account
      const stripeAccount = await this.stripe!.accounts.create({
        type: createDto.type || 'express',
        country: createDto.country || 'US',
        email: user.email,
        metadata: {
          userId: user.id.toString(),
          userType: 'trainer'
        }
      });

      // Create account link for onboarding
      const accountLink = await this.stripe!.accountLinks.create({
        account: stripeAccount.id,
        refresh_url: `${process.env.CLIENT_URL}/settings/stripe-connect?refresh=true`,
        return_url: `${process.env.CLIENT_URL}/settings/stripe-connect?success=true`,
        type: 'account_onboarding',
      });

      // Save to database
      const connectAccount = this.stripeConnectRepository.create({
        stripeAccountId: stripeAccount.id,
        type: createDto.type || 'express',
        country: createDto.country || 'US',
        email: user.email,
        chargesEnabled: stripeAccount.charges_enabled,
        detailsSubmitted: stripeAccount.details_submitted,
        payoutsEnabled: stripeAccount.payouts_enabled,
        userId: user.id
      });

      await this.stripeConnectRepository.save(connectAccount);

      this.logger.log(`Created Stripe Connect account ${stripeAccount.id} for user ${user.id}`);

      return {
        success: true,
        message: 'Stripe Connect account created successfully',
        data: {
          accountId: stripeAccount.id,
          onboardingUrl: accountLink.url
        }
      };
    } catch (error) {
      this.logger.error(`Error creating Stripe Connect account:`, error.message);
      throw new BadRequestException(`Failed to create Stripe Connect account: ${error.message}`);
    }
  }

  async findByUser(user: User): Promise<StripeConnectStatusDto> {
    const connectAccount = await this.stripeConnectRepository.findOne({
      where: { userId: user.id }
    });

    if (!connectAccount) {
      return {
        isComplete: false,
        account: null,
        stripeAccountId: null
      };
    }

    // Sync with Stripe to get latest status
    try {
      await this.ensureStripeInitialized();
      const stripeAccount = await this.stripe!.accounts.retrieve(connectAccount.stripeAccountId);
      
      // Update local record
      connectAccount.chargesEnabled = stripeAccount.charges_enabled;
      connectAccount.detailsSubmitted = stripeAccount.details_submitted;
      connectAccount.payoutsEnabled = stripeAccount.payouts_enabled;
      await this.stripeConnectRepository.save(connectAccount);

      return {
        isComplete: connectAccount.isComplete,
        account: {
          id: connectAccount.stripeAccountId,
          type: connectAccount.type,
          country: connectAccount.country,
          email: connectAccount.email,
          charges_enabled: connectAccount.chargesEnabled,
          details_submitted: connectAccount.detailsSubmitted
        },
        stripeAccountId: connectAccount.stripeAccountId
      };
    } catch (error) {
      this.logger.error('Error syncing with Stripe:', error.message);
      
      // Return local data if Stripe sync fails
      return {
        isComplete: connectAccount.isComplete,
        account: {
          id: connectAccount.stripeAccountId,
          type: connectAccount.type,
          country: connectAccount.country,
          email: connectAccount.email,
          charges_enabled: connectAccount.chargesEnabled,
          details_submitted: connectAccount.detailsSubmitted
        },
        stripeAccountId: connectAccount.stripeAccountId
      };
    }
  }

  async delete(user: User): Promise<StripeConnectDeleteResponseDto> {
    const connectAccount = await this.stripeConnectRepository.findOne({
      where: { userId: user.id }
    });

    if (!connectAccount) {
      throw new NotFoundException('No Stripe Connect account found for this user');
    }

    try {
      await this.ensureStripeInitialized();
      
      // Delete from Stripe
      await this.stripe!.accounts.del(connectAccount.stripeAccountId);
      
      // Delete from database
      await this.stripeConnectRepository.remove(connectAccount);

      this.logger.log(`Deleted Stripe Connect account ${connectAccount.stripeAccountId} for user ${user.id}`);

      return {
        success: true,
        message: 'Stripe Connect account deleted successfully'
      };
    } catch (error) {
      this.logger.error(`Error deleting Stripe Connect account:`, error.message);
      throw new BadRequestException(`Failed to delete Stripe Connect account: ${error.message}`);
    }
  }
}
