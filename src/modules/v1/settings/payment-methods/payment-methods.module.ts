import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethod } from 'shared/entities';
import { PaymentMethodsSeeder } from './payment-methods.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod])],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService, PaymentMethodsSeeder],
  exports: [PaymentMethodsService],
})
export class PaymentMethodsModule {} 