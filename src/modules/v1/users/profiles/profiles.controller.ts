import { Controller, Get, Body, Patch, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthUser } from '@/decorators/user.decorator';


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


  @Get()
  @ApiOperation({ summary: 'Get profile by user ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Profile found', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findOne(@AuthUser() user: any) {
    return this.profilesService.findOneByUser(user);
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
