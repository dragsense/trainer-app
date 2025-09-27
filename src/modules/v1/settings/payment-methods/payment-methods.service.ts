import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from 'shared/entities';
import { CreatePaymentMethodDto } from 'shared/dtos';
import { UpdatePaymentMethodDto } from 'shared/dtos';
import { PaymentMethodListDto } from 'shared/dtos';
import { PAYMENT_METHOD_CONFIGS, EPaymentMethodType } from 'shared/enums';
import { IMessageResponse } from 'shared/interfaces';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
  ) { }

  async create(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    // Check if payment method with same key already exists
    const existingMethod = await this.paymentMethodRepo.findOne({
      where: { key: createPaymentMethodDto.key }
    });

    if (existingMethod) {
      throw new ConflictException(`Payment method with key '${createPaymentMethodDto.key}' already exists`);
    }

    // Get the default name and config schema from the enum
    const config = PAYMENT_METHOD_CONFIGS[createPaymentMethodDto.key];
    const paymentMethod = this.paymentMethodRepo.create({
      ...createPaymentMethodDto,
      name: createPaymentMethodDto.name || config.name,
      configSchema: config.configSchema
    });

    return this.paymentMethodRepo.save(paymentMethod);
  }

  async findAll(queryDto: PaymentMethodListDto): Promise<PaymentMethod[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      ...filters
    } = queryDto || {};

    const query = this.paymentMethodRepo.createQueryBuilder('paymentMethod');

    // Apply filters
    if (search) {
      query.andWhere(
        '(paymentMethod.name ILIKE :search OR paymentMethod.key ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (filters && typeof filters === 'object') {
      Object.entries(filters).forEach(([key, value]) => {
        const coercedValue = !isNaN(value as any) ? Number(value) : value;
        if (coercedValue) {
          query.andWhere(`paymentMethod.${key} = :${key}`, { [key]: value });
        }
      });
    }

    if (createdAfter) {
      query.andWhere('paymentMethod.createdAt >= :createdAfter', { createdAfter });
    }

    if (createdBefore) {
      query.andWhere('paymentMethod.createdAt <= :createdBefore', { createdBefore });
    }

    if (updatedAfter) {
      query.andWhere('paymentMethod.updatedAt >= :updatedAfter', { updatedAfter });
    }

    if (updatedBefore) {
      query.andWhere('paymentMethod.updatedAt <= :updatedBefore', { updatedBefore });
    }

    const sortColumn = sortBy && sortBy in this.paymentMethodRepo.metadata.propertiesMap
      ? sortBy
      : 'createdAt';
    

    query
        .orderBy(`paymentMethod.${sortColumn}`, sortOrder as 'ASC' | 'DESC')

    const data = await query.getMany();

    return data;
  }

  async findOne(id: number): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepo.findOneBy({ id });
    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }
    return paymentMethod;
  }

  async toggleEnabled(id: number): Promise<IMessageResponse> {
    const method = await this.findOne(id);

    method.isEnabled = !method.isEnabled;
    await this.paymentMethodRepo.save(method);

    return {
      message: `Payment method with ID ${id} has been ${method.isEnabled ? 'enabled' : 'disabled'}.`
    }
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id);

    // Remove key from update - it should be immutable
    const { key, ...updateData } = updatePaymentMethodDto as any;

    Object.assign(paymentMethod, updateData);
    return this.paymentMethodRepo.save(paymentMethod);
  }

  async updateSettings(id: number, settings: { isEnabled?: boolean; config?: Record<string, any> }): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id);

    if (settings.isEnabled !== undefined && paymentMethod.key !== EPaymentMethodType.CASH) {
      paymentMethod.isEnabled = settings.isEnabled;
    }
    if (settings.config !== undefined) {
      paymentMethod.config = settings.config;
    }

    return this.paymentMethodRepo.save(paymentMethod);
  }

  async remove(id: number): Promise<{ message: string }> {
    const paymentMethod = await this.findOne(id);
    await this.paymentMethodRepo.remove(paymentMethod);
    return { message: `Payment method with ID ${id} has been deleted.` };
  }

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    return this.paymentMethodRepo.find({
      where: { isEnabled: true },
      select: ['id', 'name', 'key']
    });
  }

  async findByKey(key: EPaymentMethodType): Promise<PaymentMethod | null> {
    return this.paymentMethodRepo.findOne({
      where: { key, isEnabled: true },
      select: ['id', 'name', 'key', 'config']
    });
  }

  async getStripeConfig(): Promise<{ secretKey: string; webhookSecret?: string; publishableKey: string } | null> {
    const stripeMethod = await this.findByKey(EPaymentMethodType.STRIPE);


    if (!stripeMethod || !stripeMethod.config) {
      return null;
    }

    return {
      secretKey: stripeMethod.config.secretKey,
      webhookSecret: stripeMethod.config.webhookSecret,
      publishableKey: stripeMethod.config.publishableKey,
    };
  }
} 