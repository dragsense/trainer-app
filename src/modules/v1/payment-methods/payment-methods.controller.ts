import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthUser } from '@/decorators/user.decorator';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';
import { RoleLevelGuard } from '@/guards/level.guard';
import { MessageResponseDto } from '@/shared-dto/general.dto';
import { PaymentMethodListDto } from './dto/payment-method-list.dto';
import { MinRoleLevel } from '@/decorators/level.decorator';
import { UserLevels } from '../users/enums/user.enum';

@UseGuards(JwtAuthGuard, RoleLevelGuard)
@ApiBearerAuth('access-token')
@ApiTags('Payment Methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) { }

  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Create a new payment method' })
  @ApiResponse({
    status: 201,
    description: 'The payment method has been successfully created.',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Post()
  async create(
    @AuthUser() user: any,
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.create(user, createPaymentMethodDto);
  }

  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Get all payment methods' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved payment methods',
  })
  @Get()
  async findAll(@AuthUser() user: any, @Query() query: PaymentMethodListDto) {
    return this.paymentMethodsService.findAll(user, query);
  }

  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Get payment method by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved payment method',
  })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @Get(':id')
  async findOne(@AuthUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.paymentMethodsService.findOne(user, id);
  }

  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Update payment method' })
  @ApiResponse({
    status: 200,
    description: 'Payment method updated successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @Patch(':id')
  async update(
    @AuthUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.update(user, id, updatePaymentMethodDto);
  }

  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Delete payment method' })
  @ApiResponse({
    status: 200,
    description: 'Payment method deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @Delete(':id')
  async remove(@AuthUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.paymentMethodsService.remove(user, id);
  }

}
