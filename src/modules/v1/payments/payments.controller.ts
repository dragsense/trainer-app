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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';
import { RoleLevelGuard } from '@/guards/level.guard';
import { MessageResponseDto } from '@/shared-dto/general.dto';
import { MinRoleLevel } from '@/decorators/level.decorator';
import { UserLevels } from '../users/enums/user.enum';
import { PaymentListDto } from './dto/payment-list.dto';

@UseGuards(JwtAuthGuard, RoleLevelGuard)
@ApiBearerAuth('access-token')
@ApiTags('Payment Methods')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Create a new payment ' })
  @ApiResponse({
    status: 201,
    description: 'The payment  has been successfully created.',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Post()
  async create(
    @AuthUser() user: any,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(user, createPaymentDto);
  }

  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Get all payment ' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved payment ',
  })
  @Get()
  async findAll(@AuthUser() user: any, @Query() query: PaymentListDto) {
    return this.paymentsService.findAll(user, query);
  }

  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Get payment  by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved payment ',
  })
  @ApiResponse({ status: 404, description: 'Payment  not found' })
  @Get(':id')
  async findOne(@AuthUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(user, id);
  }

  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Update payment ' })
  @ApiResponse({
    status: 200,
    description: 'Payment  updated successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment  not found' })
  @Patch(':id')
  async update(
    @AuthUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(user, id, updatePaymentDto);
  }

  @MinRoleLevel(UserLevels.TRAINER)
  @ApiOperation({ summary: 'Delete payment ' })
  @ApiResponse({
    status: 200,
    description: 'Payment  deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment  not found' })
  @Delete(':id')
  async remove(@AuthUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.remove(user, id);
  }

}
