import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { AppSettingService } from './app-setting.service';
import { JwtAuthGuard } from '@/modules/v1/auth/gaurds/jwt-auth.gaurd';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UpdateAppSettingDto } from './dto/update-app-setting.dto';

@ApiTags('App Setting')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('settings/app-setting')
export class AppSettingController {
  constructor(private readonly appSettingService: AppSettingService) { }

  
  @Get()
  @ApiOperation({ summary: 'Get current user app setting' })
  @ApiResponse({ status: 200, description: 'App setting returned successfully.' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async getMyAppSetting(@Req() req: any) {
    const userId = req.user.id;
    return this.appSettingService.getAppSettingByUserId(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update allowNotification for current user' })
  @ApiBody({
   type: UpdateAppSettingDto,
   description: 'Update app setting for the current user',
  })
  @ApiResponse({ status: 200, description: 'allowNotification updated successfully.' })
  async updateAppSetting(
    @Req() req: any,
    @Body() settingDto: UpdateAppSettingDto,
  ) {
    const userId = req.user.id;
    return this.appSettingService.updateAppSetting(userId, settingDto);
  }
}
