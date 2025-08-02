import { Controller, Get, Body, Patch, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/gaurds/jwt-auth.gaurd';

import { ProfilesService } from './profiles.service';

import { Profile } from './entities/profile.entity';
import { UpdateProfileDto }
  from './dto/update-profile.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Profiles')
@Controller('users/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) { }

  @Get('profile/me')
  @ApiOperation({ summary: 'Get profile of the authenticated user' })
  @ApiResponse({ status: 200, description: 'Profile found', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findMe(@Req() req: any) {
    return this.profilesService.findOneByUser({ id: req.user.id });
  }


  @Patch('profile/me')
  @ApiOperation({ summary: 'Update profile of the authenticated user' })
  @ApiResponse({ status: 200, description: 'Profile updated', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateMe(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const profile = await this.profilesService.findOneByUser({ id: req.user.id });
    return this.profilesService.update(profile.id, updateProfileDto);
  }



  @Get(':id')
  @ApiOperation({ summary: 'Get profile by user ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Profile found', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.findOneByUser({ id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update profile by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Profile ID' })
  @ApiResponse({ status: 200, description: 'Profile updated', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(id, updateProfileDto);
  }

}
