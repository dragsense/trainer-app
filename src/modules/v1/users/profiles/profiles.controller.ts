import { Controller, Get, Body, Patch, Param, ParseIntPipe, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/gaurds/jwt-auth.gaurd';

import { ProfilesService } from './profiles.service';


import { RoleLevelGuard } from '@/guards/level.guard';
import { MinRoleLevel } from '@/decorators/level.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { EUserLevels, EUserRole } from 'shared/enums';
import { Profile } from 'shared/entities';
import { UpdateProfileDto } from 'shared/dtos';

@UseGuards(JwtAuthGuard, RoleLevelGuard)
@ApiBearerAuth('access-token')
@ApiTags('Profiles')
@Controller('users/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) { }

  @MinRoleLevel(EUserLevels[EUserRole.USER])
  @Get('profile/me')
  @ApiOperation({ summary: 'Get profile of the authenticated user' })
  @ApiResponse({ status: 200, description: 'Profile found', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findMe(@Req() req: any) {
    return this.profilesService.findOneByUser({ id: req.user.id });
  }


  @UseInterceptors(FileInterceptor('image.path'))
  @ApiConsumes('multipart/form-data')
  @MinRoleLevel(EUserLevels[EUserRole.USER])
  @Patch('profile/me')
  @ApiOperation({ summary: 'Update profile of the authenticated user' })
  @ApiResponse({ status: 200, description: 'Profile updated', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateMe(@Req() req: any,
    @UploadedFile() image: Express.Multer.File,
    @Body() updateProfileDto: UpdateProfileDto) {
    const profile = await this.profilesService.findOneByUser({ id: req.user.id });


    if (updateProfileDto.image) {
      updateProfileDto.image = null;
    }

    return this.profilesService.update(profile.id, updateProfileDto, image);
  }



  @MinRoleLevel(EUserLevels[EUserRole.USER])
  @Get(':id')
  @ApiOperation({ summary: 'Get profile by user ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Profile found', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.findOneByUser({ id });
  }

  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @MinRoleLevel(EUserLevels[EUserRole.USER])
  @Patch(':id')
  @ApiOperation({ summary: 'Update profile by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Profile ID' })
  @ApiResponse({ status: 200, description: 'Profile updated', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() image: Express.Multer.File,
    @Body() updateProfileDto: UpdateProfileDto) {

    if (updateProfileDto.image) {
      updateProfileDto.image = null;
    }

    return this.profilesService.update(id, updateProfileDto, image);
  }

}
