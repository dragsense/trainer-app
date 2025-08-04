import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StripeConnectService } from './stripe-connect.service';
import { AuthUser } from '@/decorators/user.decorator';
import { User } from '@/modules/v1/users/entities/user.entity';
import { JwtAuthGuard } from '@/modules/v1/auth/gaurds/jwt-auth.gaurd';
import { CreateStripeConnectDto } from './dto/create-stripe-connect.dto';
import { 
  StripeConnectStatusDto, 
  StripeConnectCreateResponseDto, 
  StripeConnectDeleteResponseDto 
} from './dto/stripe-connect-responses.dto';

@ApiTags('Settings - Stripe Connect')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings/stripe-connect')
export class StripeConnectController {
  constructor(private readonly stripeConnectService: StripeConnectService) {}

  @Post()
  @ApiOperation({ summary: 'Create Stripe Connect account' })
  @ApiResponse({ 
    status: 201, 
    description: 'Stripe Connect account created successfully',
    type: StripeConnectCreateResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Account already exists or invalid data' })
  async create(
    @AuthUser() user: User,
    @Body() createDto: CreateStripeConnectDto,
  ): Promise<StripeConnectCreateResponseDto> {
    return this.stripeConnectService.create(user, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get Stripe Connect account status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Account status retrieved successfully',
    type: StripeConnectStatusDto 
  })
  async getStatus(@AuthUser() user: User): Promise<StripeConnectStatusDto> {
    return this.stripeConnectService.findByUser(user);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete Stripe Connect account' })
  @ApiResponse({ 
    status: 200, 
    description: 'Stripe Connect account deleted successfully',
    type: StripeConnectDeleteResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async delete(@AuthUser() user: User): Promise<StripeConnectDeleteResponseDto> {
    return this.stripeConnectService.delete(user);
  }
}
