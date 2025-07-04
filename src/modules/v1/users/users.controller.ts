import {
  Controller,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { AuthUser } from '@/decorators/user.decorator';


import { UsersService } from './users.service';

import {
  UserWithProfileSafeDto,
} from './dtos/user-responses.dto';

import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }


  @ApiOperation({ summary: 'Get a authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns a authenticated user.',
    type: UserWithProfileSafeDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('me')
  findOne(@AuthUser() user: any) {
    const userId = user.id;
    return this.usersService.findOne(
      { id: userId },
      {
        select: ['id', 'email'],
        relations: ['profile']
      });
  }

}
