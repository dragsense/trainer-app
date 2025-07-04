import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageResponse } from '@/interfaces/general.interface';
import { User } from '../users/entities/user.entity';
import { PaymentListDto } from './dto/payment-list.dto';
import { PaginationResponse } from '@/interfaces/pagination-response.interface';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) { }

  async create(user: Pick<User, 'id'>, createPaymentDto: CreatePaymentDto): Promise<MessageResponse> {
    const payment = this.paymentsRepository.create({
      ...createPaymentDto,
      client: { id: user.id },
    });
    await this.paymentsRepository.save(payment);
    return { message: 'Payment  created successfully' };
  }

  async findAll(user: Pick<User, 'id'>, queryDto: PaymentListDto): Promise<PaginationResponse<Payment>> {
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


    const query = this.paymentsRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user');

    if (user) {
      query.andWhere('payment.user.id = :userId', { userId: user.id });
    }

    if (search) {
      query.where('payment.name ILIKE :search', { search: `%${search}%` });
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
      query.andWhere('payment.createdAt >= :createdAfter', { createdAfter });
    }

    if (createdAfter) {
      query.andWhere('payment.createdAt >= :createdAfter', { createdAfter });
    }

    if (createdBefore) {
      query.andWhere('payment.createdAt <= :createdBefore', { createdBefore });
    }

    if (updatedAfter) {
      query.andWhere('payment.updatedAt >= :updatedAfter', { updatedAfter });
    }

    if (updatedBefore) {
      query.andWhere('payment.updatedAt <= :updatedBefore', { updatedBefore });
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

  async findOne(user: Pick<User, 'id'>, id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id, client: { id: user.id } },
    });

    if (!payment) {
      throw new NotFoundException(`Payment  with ID ${id} not found`);
    }

    return payment;
  }

  async update(user: Pick<User, 'id'>, id: number, updatePaymentDto: UpdatePaymentDto): Promise<MessageResponse> {
    const payment = await this.findOne(user, id);

    Object.assign(payment, updatePaymentDto);
    await this.paymentsRepository.save(payment);

    return { message: 'Payment  updated successfully' };
  }

  async remove(user: Pick<User, 'id'>, id: number): Promise<void> {
    const payment = await this.findOne(user, id);
    await this.paymentsRepository.remove(payment);
  }
}
