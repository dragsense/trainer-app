import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Billing } from './entities/billing.entity';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto, UpdateBillingStatusDto } from './dto/update-billing.dto';
import { User } from '@/modules/v1/users/entities/user.entity';
import { PaginationResponse } from '@/interfaces/pagination-response.interface';
import { BillingListDto } from './dto/billing-list.dto';
import { UsersService } from '../users/users.service';
import { BillingCurrency, BillingStatus } from './enums/billing.enum';
import { SessionsService } from '../sessions/sessions.service';
import { Session } from '../sessions/entities/session.entity';
import { PaymentMethodsService } from '../settings/payment-methods/payment-methods.service';
import { UserLevels, UserRole } from '../users/enums/user.enum';
import { FileUpload } from '../file-upload/entities/file-upload.entity';
import { FileUploadService } from '../file-upload/file-upload.service';

@Injectable()
export class BillingsService {
  constructor(
    @InjectRepository(Billing)
    private readonly billingRepo: Repository<Billing>,
    private readonly userService: UsersService,
    private readonly sessionService: SessionsService,
    private readonly paymentMethodService: PaymentMethodsService,
    private fileUploadService: FileUploadService,

  ) { }

  async create(createDto: CreateBillingDto, authUser: User): Promise<Billing> {
    const {
      userId,
      sessionId,
      stripeInvoiceId,
      status,
      currency,
      lineItems,
      totalTax = 0,
      discount = 0,
      totalAmount,
      paymentMethodType,
      ...rest
    } = createDto;



    // Fetch required relations
    const user = await this.userService.findOne({ id: userId });
    let session: Session | undefined = undefined;

    if (sessionId) {
      session = await this.sessionService.findOneById(sessionId);
    }


    const paymentMethod = await this.paymentMethodService.findByKey(paymentMethodType);

    if (!paymentMethod)
      throw new NotFoundException(`Payment Method Not Found.`);


    // Auto-calculate totalAmount if not provided but line items exist
    let calculatedTotal = 0;
    if (!totalAmount && Array.isArray(lineItems)) {
      const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      calculatedTotal = subtotal + totalTax - discount;
    }

    const localInvoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;

    const billing = this.billingRepo.create({
      ...rest,
      invoiceAmount: calculatedTotal,
      dueAmount: calculatedTotal,
      localInvoiceNumber,
      user,
      session,
      stripeInvoiceId,
      status: status || BillingStatus.PENDING,
      currency: currency || BillingCurrency.USD,
      lineItems,
      totalTax,
      discount,
      totalAmount: calculatedTotal,
      paymentMethod,
      creator: authUser
    });

    try {
      return await this.billingRepo.save(billing);
    } catch (error) {
      if (error.code === '23505' && error.detail?.includes('stripeInvoiceId')) {
        throw new ConflictException('Stripe invoice ID must be unique');
      }
      throw error;
    }
  }

  async findAll(queryDto: BillingListDto, user: User): Promise<PaginationResponse<Billing>> {
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


    const query = this.billingRepo
      .createQueryBuilder('billing')
      .leftJoinAndSelect('billing.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoin('billing.creator', 'creator');


    if (user && user.level !== UserLevels[UserRole.SUPER_ADMIN]) {
      query.where('creator.id = :userId', { userId: user.id });
    }

    query
      .orderBy('billing.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    if (search) {
      query.andWhere(
        `(billing.stripeInvoiceId ILIKE :search OR user.name ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (filters && typeof filters === 'object') {
      Object.entries(filters).forEach(([key, value]) => {
        const coercedValue = !isNaN(value as any) ? Number(value) : value;
        if (coercedValue) {
          query.andWhere(`billing.${key} = :${key}`, { [key]: value });
        }
      });
    }
    if (createdAfter) query.andWhere('billing.createdAt >= :createdAfter', { createdAfter });
    if (createdBefore) query.andWhere('billing.createdAt <= :createdBefore', { createdBefore });
    if (updatedAfter) query.andWhere('billing.updatedAt >= :updatedAfter', { updatedAfter });
    if (updatedBefore) query.andWhere('billing.updatedAt <= :updatedBefore', { updatedBefore });

    const [data, total] = await query.getManyAndCount();
    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: number): Promise<Billing> {
    const billing = await this.billingRepo.findOne({
      where: { id },
      relations: ['user', 'documents'],
    });

    if (!billing) {
      throw new NotFoundException(`Billing with ID ${id} not found`);
    }

    return billing;
  }


  async update(id: number, updateDto: UpdateBillingDto): Promise<Billing> {
    const billing = await this.billingRepo.preload({ id, ...updateDto });
    if (!billing) {
      throw new NotFoundException(`Billing with ID ${id} not found`);
    }

    // Optional: handle user update if userId is provided
    if ((updateDto as any).userId) {
      const user = await this.userService.findOne((updateDto as any).userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${(updateDto as any).userId} not found`);
      }
      billing.user = user;
    }

    try {
      return await this.billingRepo.save(billing);
    } catch (error) {
      if (error.code === '23505' && error.detail.includes('stripeInvoiceId')) {
        throw new ConflictException('Stripe invoice ID must be unique');
      }
      throw error;
    }
  }

  async updateStatus(id: number, statusDto: UpdateBillingStatusDto, documents: Express.Multer.File[]): Promise<Billing> {
    const billing = await this.billingRepo.findOne({ where: { id }, relations: ['documents'] });

    if (!billing) {
      throw new NotFoundException(`Billing with ID ${id} not found`);
    }

    const {
      status,
      removedDocuments
    } = statusDto;

    if (removedDocuments?.length) {
      for (const docId of removedDocuments) {
        const doc = billing.documents.find(d => d.id === docId);
        if (doc) {
          await this.fileUploadService.deleteFile(doc);
        }
      }
      billing.documents = billing.documents.filter(d => !removedDocuments.includes(d.id));
    }



    if (documents && documents.length > 0) {
      const uploadedDocs: FileUpload[] = [];
      for (const file of documents) {

        const uploaded = await this.fileUploadService.uploadFile(file, 'billings');
        uploadedDocs.push(uploaded);
      }
      billing.documents = [...billing.documents, ...uploadedDocs];
    }

    billing.status = status;
    return await this.billingRepo.save(billing);
  }

  async remove(id: number): Promise<Billing> {
    const billing = await this.findOne(id);
    return await this.billingRepo.remove(billing);
  }

}
