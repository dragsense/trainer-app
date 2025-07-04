import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageResponse } from '@/interfaces/general.interface';
import { User } from '../users/entities/user.entity';
import { PaymentMethodListDto } from './dto/payment-method-list.dto';
import { PaginationResponse } from '@/interfaces/pagination-response.interface';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodsRepository: Repository<PaymentMethod>,
  ) { }

  async create(user: Pick<User, 'id'>, createPaymentMethodDto: CreatePaymentMethodDto): Promise<MessageResponse> {
    const paymentMethod = this.paymentMethodsRepository.create({
      ...createPaymentMethodDto,
      user: { id: user.id },
    });
    await this.paymentMethodsRepository.save(paymentMethod);
    return { message: 'Payment method created successfully' };
  }

  async findAll(user: Pick<User, 'id'>, queryDto: PaymentMethodListDto): Promise<PaginationResponse<PaymentMethod>> {
    const {
      page = 1,
      limit = 10,
      search,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      ...filters
    } = queryDto;


    const query = this.paymentMethodsRepository.createQueryBuilder('paymentMethod')
      .leftJoinAndSelect('paymentMethod.user', 'user');

    if (user) {
      query.andWhere('paymentMethod.user.id = :userId', { userId: user.id });
    }

    if (search) {
      query.where('paymentMethod.name ILIKE :search', { search: `%${search}%` });
    }

    if (filters && typeof filters === 'object') {
      Object.entries(filters).forEach(([key, value]) => {
        const coercedValue = !isNaN(value as any) ? Number(value) : value;
        if (coercedValue) {
          query.andWhere(`user.${key} = :${key}`, { [key]: value });
        }
      });
    }

    if (createdAfter) {
      query.andWhere('paymentMethod.createdAt >= :createdAfter', { createdAfter });
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

    const [results, total] = await query.getManyAndCount();
    const lastPage = Math.ceil(total / limit);

    return {
      data: results,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };
  }

  async findOne(user: Pick<User, 'id'>, id: number): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodsRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    return paymentMethod;
  }

  async update(user: Pick<User, 'id'>, id: number, updatePaymentMethodDto: UpdatePaymentMethodDto): Promise<MessageResponse> {
    const paymentMethod = await this.findOne(user, id);

    Object.assign(paymentMethod, updatePaymentMethodDto);
    await this.paymentMethodsRepository.save(paymentMethod);

    return { message: 'Payment method updated successfully' };
  }

  async remove(user: Pick<User, 'id'>, id: number): Promise<MessageResponse> {
    const paymentMethod = await this.findOne(user, id);
    await this.paymentMethodsRepository.remove(paymentMethod);
    return { message: 'Payment method removed successfully' };
  }
}
