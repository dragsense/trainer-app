import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { AppSettingService } from './app-setting.service';
import { JwtAuthGuard } from '@/modules/v1/auth/gaurds/jwt-auth.gaurd';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UpdateAppSettingDto } from './dto/update-app-setting.dto';
import { AppSetting } from './entities/app-setting.entity';

@ApiTags('App Setting')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('settings/app-setting')
export class AppSettingController {
  constructor(private readonly appSettingService: AppSettingService) { }

  @Get()
  @ApiOperation({ summary: 'Get current user app settings' })
  @ApiResponse({ 
    status: 200, 
    description: 'App settings returned successfully.',
    type: AppSetting
  })
  @ApiResponse({ status: 404, description: 'App settings not found' })
  async getMyAppSetting(@Req() req: any): Promise<AppSetting> {
    const userId = req.user.id;
    return this.appSettingService.getAppSettingByUserId(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update app settings for current user' })
  @ApiBody({
    type: UpdateAppSettingDto,
    description: 'Update app settings for the current user',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'App settings updated successfully.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'App settings updated successfully'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  async updateAppSetting(
    @Req() req: any,
    @Body() settingDto: UpdateAppSettingDto,
  ) {
    const userId = req.user.id;
    return this.appSettingService.updateAppSetting(userId, settingDto);
  }
}