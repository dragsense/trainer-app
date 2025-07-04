import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({
    status: 200,
    description: 'API information retrieved successfully',
    schema: {},
  })
  getAppInfo(): string {
    return this.appService.getAppInfo();
  }
}