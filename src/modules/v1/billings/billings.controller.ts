/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  ParseIntPipe,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { BillingsService } from './billings.service';
import { StripeBillingService } from '../stripe/services/stripe-billing.service';
import { StripeInvoiceService } from '../stripe/services/stripe-invoice.service';
import { StripeTransactionService } from '../stripe/services/stripe-transaction.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { BillingListDto } from './dto/billing-list.dto';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';
import { UserLevels, UserRole } from '../users/enums/user.enum';

@ApiTags('Billings')
@Controller('billings')
@UseGuards(JwtAuthGuard)
export class BillingsController {
  constructor(
    private readonly billingsService: BillingsService,
    private readonly stripeBillingService: StripeBillingService,
    private readonly stripeInvoiceService: StripeInvoiceService,
    private readonly stripeTransactionService: StripeTransactionService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new billing record for a member' })
  @ApiResponse({ status: 201, description: 'Billing created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid billing input' })
  @ApiResponse({ status: 409, description: 'Invoice number must be unique' })
  @ApiBody({ type: CreateBillingDto })
  create(@Req() req: any, @Body() createBillingDto: CreateBillingDto) {
    return this.billingsService.create(createBillingDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of billing records' })
  @ApiResponse({ status: 200, description: 'Billings fetched successfully' })
  findAll(@Req() req: any, @Query() query: BillingListDto) {
    const user = req.user.level === UserLevels[UserRole.ADMIN] ? null : req.user;
    return this.billingsService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get billing details by ID' })
  @ApiResponse({ status: 200, description: 'Billing found' })
  @ApiResponse({ status: 404, description: 'Billing not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'Billing ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.billingsService.findOne(id);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update billing details' })
  @ApiResponse({ status: 200, description: 'Billing updated successfully' })
  @ApiResponse({ status: 404, description: 'Billing not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'Billing ID' })
  @ApiResponse({ status: 409, description: 'Invoice number must be unique' })
  @ApiBody({ type: UpdateBillingDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBillingDto: UpdateBillingDto,
  ) {
    return this.billingsService.update(id, updateBillingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a billing record by ID' })
  @ApiResponse({ status: 204, description: 'Billing deleted successfully' })
  @ApiResponse({ status: 404, description: 'Billing not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'Billing ID' })
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.billingsService.remove(id);
  }

  // Stripe Direct API Endpoints
  @Get('stripe/customers')
  @ApiOperation({ summary: 'Get all Stripe customers' })
  @ApiResponse({ status: 200, description: 'Stripe customers fetched successfully' })
  async getStripeCustomers(@Query('limit') limit?: number) {
    return await this.stripeBillingService.listCustomers(limit || 100);
  }

  @Get('stripe/customers/:customerId')
  @ApiOperation({ summary: 'Get Stripe customer by ID' })
  @ApiResponse({ status: 200, description: 'Stripe customer found' })
  @ApiResponse({ status: 404, description: 'Stripe customer not found' })
  @ApiParam({ name: 'customerId', type: 'string', description: 'Stripe Customer ID' })
  async getStripeCustomer(@Param('customerId') customerId: string) {
    return await this.stripeBillingService.getCustomer(customerId);
  }

  @Get('stripe/invoices')
  @ApiOperation({ summary: 'Get Stripe invoices' })
  @ApiResponse({ status: 200, description: 'Stripe invoices fetched successfully' })
  async getStripeInvoices(
    @Req() req: any,
    @Query('customerId') customerId?: string,
    @Query('subscriptionId') subscriptionId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
  ) {
    const user = req.user;
    if (!customerId && user.level !== UserLevels[UserRole.ADMIN]) {
      customerId = user.stripeCustomerId;
    }
    return await this.stripeInvoiceService.listInvoices(customerId, subscriptionId, status, limit || 100);
  }

  @Get('stripe/invoices/:invoiceId')
  @ApiOperation({ summary: 'Get Stripe invoice by ID' })
  @ApiResponse({ status: 200, description: 'Stripe invoice found' })
  @ApiResponse({ status: 404, description: 'Stripe invoice not found' })
  @ApiParam({ name: 'invoiceId', type: 'string', description: 'Stripe Invoice ID' })
  async getStripeInvoice(@Param('invoiceId') invoiceId: string) {
    return await this.stripeInvoiceService.getInvoice(invoiceId);
  }

  @Get('stripe/invoices/:invoiceId/pdf')
  @ApiOperation({ summary: 'Get Stripe invoice PDF URL' })
  @ApiResponse({ status: 200, description: 'Stripe invoice PDF URL fetched successfully' })
  @ApiParam({ name: 'invoiceId', type: 'string', description: 'Stripe Invoice ID' })
  async getStripeInvoicePDF(@Param('invoiceId') invoiceId: string) {
    const pdfUrl = await this.stripeInvoiceService.getInvoicePDF(invoiceId);
    return { pdfUrl };
  }


  @Get('stripe/transactions/charges')
  @ApiOperation({ summary: 'Get Stripe charges' })
  @ApiResponse({ status: 200, description: 'Stripe charges fetched successfully' })
  async getStripeCharges(
    @Req() req: any,
    @Query('customerId') customerId?: string,
    @Query('paymentIntentId') paymentIntentId?: string,
    @Query('limit') limit?: number,
  ) {
    const user = req.user;
    if (!customerId && user.level !== UserLevels[UserRole.ADMIN]) {
      customerId = user.stripeCustomerId;
    }
    return await this.stripeTransactionService.listCharges(customerId, paymentIntentId, limit || 100);
  }

  @Get('stripe/transactions/charges/:chargeId')
  @ApiOperation({ summary: 'Get Stripe charge by ID' })
  @ApiResponse({ status: 200, description: 'Stripe charge found' })
  @ApiResponse({ status: 404, description: 'Stripe charge not found' })
  @ApiParam({ name: 'chargeId', type: 'string', description: 'Stripe Charge ID' })
  async getStripeCharge(@Param('chargeId') chargeId: string) {
    return await this.stripeTransactionService.getCharge(chargeId);
  }

  @Get('stripe/transactions/payment-intents/:paymentIntentId')
  @ApiOperation({ summary: 'Get Stripe payment intent by ID' })
  @ApiResponse({ status: 200, description: 'Stripe payment intent found' })
  @ApiResponse({ status: 404, description: 'Stripe payment intent not found' })
  @ApiParam({ name: 'paymentIntentId', type: 'string', description: 'Stripe Payment Intent ID' })
  async getStripePaymentIntent(@Param('paymentIntentId') paymentIntentId: string) {
    return await this.stripeTransactionService.getPaymentIntent(paymentIntentId);
  }

  @Get('stripe/balance')
  @ApiOperation({ summary: 'Get Stripe account balance' })
  @ApiResponse({ status: 200, description: 'Stripe balance fetched successfully' })
  async getStripeBalance() {
    return await this.stripeTransactionService.getBalance();
  }

  @Get('stripe/balance/transactions')
  @ApiOperation({ summary: 'Get Stripe balance transactions' })
  @ApiResponse({ status: 200, description: 'Stripe balance transactions fetched successfully' })
  async getStripeBalanceTransactions(@Query('limit') limit?: number) {
    return await this.stripeTransactionService.getBalanceTransactions(limit || 100);
  }




  @Get('stripe/customers/:customerId/pending-billings')
  @ApiOperation({ summary: 'Check for pending billings for a customer' })
  @ApiResponse({ status: 200, description: 'Pending billings check completed' })
  @ApiParam({ name: 'customerId', type: 'string', description: 'Stripe Customer ID' })
  async checkPendingBillings(@Param('customerId') customerId: string) {
    const hasPending = await this.stripeBillingService.checkPendingBillings(customerId);
    return {
      customerId,
      hasPendingBillings: hasPending,
      message: hasPending ? 'Customer has pending billings' : 'No pending billings found'
    };
  }






}
