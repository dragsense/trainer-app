import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { AppSettingService } from './app-setting.service';
import { JwtAuthGuard } from '@/modules/v1/auth/gaurds/jwt-auth.gaurd';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('App Setting')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('app-setting')
export class AppSettingController {
  constructor(private readonly appSettingService: AppSettingService) { }

  @Get('me')
  @ApiOperation({ summary: 'Get current user app setting' })
  @ApiResponse({ status: 200, description: 'App setting returned successfully.' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async getMyAppSetting(@Req() req: any) {
    const userId = req.user.id;
    return this.appSettingService.getAppSettingByUserId(userId);
  }

  @Patch('allow-notification')
  @ApiOperation({ summary: 'Update allowNotification for current user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        allowNotification: { type: 'boolean', example: true },
      },
      required: ['allowNotification'],
    },
  })
  @ApiResponse({ status: 200, description: 'allowNotification updated successfully.' })
  async updateAllowNotification(
    @Req() req: any,
    @Body('allowNotification') allowNotification: boolean,
  ) {
    const userId = req.user.id;
    return this.appSettingService.updateAllowNotification(userId, allowNotification);
  }
}
