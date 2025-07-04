import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppInfo(): any {
    return {
      message: 'DragSense CRM Web App',
      description:
        'Designed to be **modular, extensible, and blueprint-driven**, DragSense empowers users to define data, logic, roles, UI, and behavior dynamically.',
      version: '1.0.0',
      documentation: '/api/docs',
      developer: 'DragSense',
    };
  }
}