import { Injectable,  Logger } from '@nestjs/common';


import { UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
@UseInterceptors(CacheInterceptor)
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor() {}

  getAppInfo() {
    return {
      name: 'Trainer App Web Platform',
      description: 'A comprehensive solution to manage fitness trainers, their clients, sessions, and payments',
      version: '1.0.0',
      documentation: '/api/docs',
    };
  }

}