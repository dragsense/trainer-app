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
  UseGuards,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  UploadedFiles
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

import { BillingsService } from './billings.service';
import { StripeBillingService } from '../stripe/services/stripe-billing.service';
import { StripeInvoiceService } from '../stripe/services/stripe-invoice.service';
import { StripeTransactionService } from '../stripe/services/stripe-transaction.service';
import { CreateBillingDto, UpdateBillingDto, UpdateBillingStatusDto } from 'shared/dtos';
import { BillingListDto } from 'shared/dtos';
import { StripeInvoiceListDto } from 'shared/dtos';
import { StripeTransactionListDto } from 'shared/dtos';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';
import { EUserLevels, EUserRole } from 'shared/enums';
import { RoleLevelGuard } from '@/guards/level.guard';
import { MinRoleLevel } from '@/decorators/level.decorator';
import { UsersService } from '../users/users.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Billings')
@Controller('billings')
@UseGuards(JwtAuthGuard, RoleLevelGuard)
export class BillingsController {
  constructor(
    private readonly billingsService: BillingsService,
    private readonly stripeBillingService: StripeBillingService,
    private readonly stripeInvoiceService: StripeInvoiceService,
    private readonly stripeTransactionService: StripeTransactionService,
    private readonly userService: UsersService
  ) { }

  @MinRoleLevel(EUserLevels[EUserRole.TRAINER])
  @Post()
  @ApiOperation({ summary: 'Create a new billing record for a member' })
  @ApiResponse({ status: 201, description: 'Billing created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid billing input' })
  @ApiResponse({ status: 409, description: 'Invoice number must be unique' })
  @ApiBody({ type: CreateBillingDto })
  create(@Req() req: any, @Body() createBillingDto: CreateBillingDto) {
    return this.billingsService.create(createBillingDto, req.user);
  }

  @MinRoleLevel(EUserLevels[EUserRole.USER])
  @Get()
  @ApiOperation({ summary: 'Get paginated list of billing records' })
  @ApiResponse({ status: 200, description: 'Billings fetched successfully' })
  findAll(@Req() req: any, @Query() query: BillingListDto) {
    const user = req.user.level === EUserLevels[EUserRole.SUPER_ADMIN] ? null : req.user;
    return this.billingsService.findAll(query, user);
  }

  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Get(':id')
  @ApiOperation({ summary: 'Get billing details by ID' })
  @ApiResponse({ status: 200, description: 'Billing found' })
  @ApiResponse({ status: 404, description: 'Billing not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'Billing ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.billingsService.findOne(id);
  }

  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
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


  @UseInterceptors(FilesInterceptor('documents[]', 5)) 
  @ApiConsumes('multipart/form-data')
  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update billing status only' })
  @ApiParam({ name: 'id', type: 'number', description: 'Billing ID' })
  @ApiBody({ type: UpdateBillingStatusDto })
  @ApiResponse({ status: 200, description: 'Billing status updated successfully' })
  @ApiResponse({ status: 404, description: 'Billing not found' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() documents: Express.Multer.File[],
    @Body() dto: UpdateBillingStatusDto,
  ) {
    console.log
    return this.billingsService.updateStatus(id, dto, documents);
  }

  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
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
  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Get('stripe/customers')
  @ApiOperation({ summary: 'Get all Stripe customers' })
  @ApiResponse({ status: 200, description: 'Stripe customers fetched successfully' })
  async getStripeCustomers(@Query('limit') limit?: number) {
    return await this.stripeBillingService.listCustomers(limit || 100);
  }

  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Get('stripe/customers/:customerId')
  @ApiOperation({ summary: 'Get Stripe customer by ID' })
  @ApiResponse({ status: 200, description: 'Stripe customer found' })
  @ApiResponse({ status: 404, description: 'Stripe customer not found' })
  @ApiParam({ name: 'customerId', type: 'string', description: 'Stripe Customer ID' })
  async getStripeCustomer(@Param('customerId') customerId: string) {
    return await this.stripeBillingService.getCustomer(customerId);
  }

  @MinRoleLevel(EUserLevels[EUserRole.USER])
  @Get('stripe/invoices')
  @ApiOperation({ summary: 'Get Stripe invoices' })
  @ApiResponse({ status: 200, description: 'Stripe invoices fetched successfully' })
  async getStripeInvoices(
    @Req() req: any,
    @Query() query: StripeInvoiceListDto,
  ) {
    let customerId = '';
    const user = req.user;
    if (user.level !== EUserLevels[EUserRole.SUPER_ADMIN]) {
      const loggedInUser = await this.userService.findOne({ id: user.id });
      customerId = loggedInUser.stripeCustomerId;
    }

    // Use the new filtering method
    return await this.stripeInvoiceService.listInvoicesWithFilters({
      ...query,
      customerId: customerId || query.customerId,
    });
  }

  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Get('stripe/invoices/:invoiceId')
  @ApiOperation({ summary: 'Get Stripe invoice by ID' })
  @ApiResponse({ status: 200, description: 'Stripe invoice found' })
  @ApiResponse({ status: 404, description: 'Stripe invoice not found' })
  @ApiParam({ name: 'invoiceId', type: 'string', description: 'Stripe Invoice ID' })
  async getStripeInvoice(@Param('invoiceId') invoiceId: string) {
    return await this.stripeInvoiceService.getInvoice(invoiceId);
  }

  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Get('stripe/invoices/:invoiceId/pdf')
  @ApiOperation({ summary: 'Get Stripe invoice PDF URL' })
  @ApiResponse({ status: 200, description: 'Stripe invoice PDF URL fetched successfully' })
  @ApiParam({ name: 'invoiceId', type: 'string', description: 'Stripe Invoice ID' })
  async getStripeInvoicePDF(@Param('invoiceId') invoiceId: string) {
    const pdfUrl = await this.stripeInvoiceService.getInvoicePDF(invoiceId);
    return { pdfUrl };
  }

  @MinRoleLevel(EUserLevels[EUserRole.USER])
  @Get('stripe/transactions')
  @ApiOperation({ summary: 'Get Stripe transactions' })
  @ApiResponse({ status: 200, description: 'Stripe transactions fetched successfully' })
  async getStripeTransactions(
    @Req() req: any,
    @Query() query: StripeTransactionListDto,
  ) {
    let customerId = '';
    const user = req.user;
    if (user.level !== EUserLevels[EUserRole.SUPER_ADMIN]) {
      const loggedInUser = await this.userService.findOne({ id: user.id });
      customerId = loggedInUser.stripeCustomerId;
    }

    // Use the new filtering method
    return await this.stripeTransactionService.listPaymentIntentsWithFilters({
      ...query,
      customerId: customerId || query.customerId,
    });
  }


  @MinRoleLevel(EUserLevels[EUserRole.USER])
  @Get('stripe/transactions/charges')
  @ApiOperation({ summary: 'Get Stripe charges' })
  @ApiResponse({ status: 200, description: 'Stripe charges fetched successfully' })
  async getStripeCharges(
    @Req() req: any,
    @Query('paymentIntentId') paymentIntentId?: string,
    @Query('limit') limit?: number,
  ) {
    let customerId = '';
    const user = req.user;
    if (user.level !== EUserLevels[EUserRole.SUPER_ADMIN]) {
      const loggedInUser = await this.userService.findOne({ id: user.id });
      customerId = loggedInUser.stripeCustomerId;
    }
    return await this.stripeTransactionService.listCharges(customerId, paymentIntentId, limit || 100);
  }

  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Get('stripe/transactions/charges/:chargeId')
  @ApiOperation({ summary: 'Get Stripe charge by ID' })
  @ApiResponse({ status: 200, description: 'Stripe charge found' })
  @ApiResponse({ status: 404, description: 'Stripe charge not found' })
  @ApiParam({ name: 'chargeId', type: 'string', description: 'Stripe Charge ID' })
  async getStripeCharge(@Param('chargeId') chargeId: string) {
    return await this.stripeTransactionService.getCharge(chargeId);
  }

  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Get('stripe/transactions/payment-intents/:paymentIntentId')
  @ApiOperation({ summary: 'Get Stripe payment intent by ID' })
  @ApiResponse({ status: 200, description: 'Stripe payment intent found' })
  @ApiResponse({ status: 404, description: 'Stripe payment intent not found' })
  @ApiParam({ name: 'paymentIntentId', type: 'string', description: 'Stripe Payment Intent ID' })
  async getStripePaymentIntent(@Param('paymentIntentId') paymentIntentId: string) {
    return await this.stripeTransactionService.getPaymentIntent(paymentIntentId);
  }

  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Get('stripe/balance')
  @ApiOperation({ summary: 'Get Stripe account balance' })
  @ApiResponse({ status: 200, description: 'Stripe balance fetched successfully' })
  async getStripeBalance() {
    return await this.stripeTransactionService.getBalance();
  }

  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Get('stripe/balance/transactions')
  @ApiOperation({ summary: 'Get Stripe balance transactions' })
  @ApiResponse({ status: 200, description: 'Stripe balance transactions fetched successfully' })
  async getStripeBalanceTransactions(@Query('limit') limit?: number) {
    return await this.stripeTransactionService.getBalanceTransactions(limit || 100);
  }



  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
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
