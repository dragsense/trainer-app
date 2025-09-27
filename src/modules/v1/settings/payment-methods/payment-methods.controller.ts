import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from 'shared/dtos';
import { UpdatePaymentMethodDto } from 'shared/dtos';
import { PaymentMethodListDto } from 'shared/dtos';
import { PaymentMethod } from 'shared/entities';
import { PaymentMethodsSeeder } from './payment-methods.seeder';
import { JwtAuthGuard } from '@/modules/v1/auth/gaurds/jwt-auth.gaurd';
import { RoleLevelGuard } from '@/guards/level.guard';
import { MinRoleLevel } from '@/decorators/level.decorator';
import { EUserLevels, EUserRole } from 'shared/enums';

@UseGuards(JwtAuthGuard, RoleLevelGuard)
@MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
@ApiTags('Payment Methods')
@Controller('settings/payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService,
    private readonly paymentMethodsSeeder: PaymentMethodsSeeder
  ) { }

  async onApplicationBootstrap() {
    await this.paymentMethodsSeeder.seed();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new payment method' })
  @ApiResponse({ status: 201, description: 'Payment method created successfully', type: PaymentMethod })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Payment method with this key already exists' })
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    return this.paymentMethodsService.create(createPaymentMethodDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payment methods with pagination' })
  @ApiResponse({
    status: 200, description: 'Payment methods retrieved successfully', type: PaymentMethod,
    isArray: true,
  })
  findAll(@Query() query: PaymentMethodListDto) {
    return this.paymentMethodsService.findAll(query);
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get a payment method by ID' })
  @ApiResponse({ status: 200, description: 'Payment method retrieved successfully', type: PaymentMethod })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  findOne(@Param('id') id: string): Promise<PaymentMethod> {
    return this.paymentMethodsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment method' })
  @ApiResponse({ status: 200, description: 'Payment method updated successfully', type: PaymentMethod })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 409, description: 'Payment method with this key already exists' })
  update(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.update(+id, updatePaymentMethodDto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle enabled status of a payment method' })
  @ApiResponse({ status: 200, description: 'Payment method enabled/disabled successfully', type: PaymentMethod })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  toggleEnabled(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentMethodsService.toggleEnabled(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment method' })
  @ApiResponse({ status: 200, description: 'Payment method deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.paymentMethodsService.remove(+id);
  }


  @Get('active/all')
  @ApiOperation({ summary: 'Get all active payment methods' })
  @ApiResponse({
    status: 200,
    description: 'List of active payment methods',
    type: [PaymentMethod]
  })
  getActivePaymentMethods() {
    return this.paymentMethodsService.getActivePaymentMethods();
  }
} 