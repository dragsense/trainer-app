import {
  Controller,
  Get,
  UseGuards,
  Body,
  Post,
  Put,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  Version,
  Patch,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { AuthUser } from '@/decorators/user.decorator';
import { MinRoleLevel } from '@/decorators/level.decorator';

import { UsersService } from './users.service';

import {
  UserPaginatedDto,
  UserWithProfileSafeDto,
} from 'shared/dtos';
import { CreateUserDto } from 'shared/dtos';
import { UpdateUserDto } from 'shared/dtos';

import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';
import { EUserRole, EUserLevels } from 'shared/enums';
import { RoleLevelGuard } from '@/guards/level.guard';
import { ResetPasswordDto } from 'shared/dtos';
import { UserListDto } from 'shared/dtos';
import { UserAvailabilityDto } from 'shared/dtos';

@UseGuards(JwtAuthGuard, RoleLevelGuard)
@ApiBearerAuth('access-token')
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiQuery({ type: UserListDto })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of users',
    type: UserPaginatedDto,
  })
  @MinRoleLevel(EUserLevels[EUserRole.USER])
  @Get()
  findAll(
    @Query() query: UserListDto,
    @AuthUser() user: any
  ) {
    return this.usersService.findAll(query, user);
  }

  @MinRoleLevel(EUserLevels[EUserRole.USER])
  @ApiOperation({ summary: 'Get authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns authenticated user',
    type: UserWithProfileSafeDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('me')
  findMe(@AuthUser() user: any) {
    const userId = user.id;
    return this.usersService.findOne(
      { id: userId },
      { select: ['id', 'email', 'level'], relations: ['profile'] }
    );
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns user by ID',
    type: UserWithProfileSafeDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @MinRoleLevel(EUserLevels[EUserRole.TRAINER])
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.findOne(
      { id },
      { relations: ['profile'] }
    );
  }

  @ApiOperation({ summary: 'Add a new user (Admin: add trainer/client, Trainer: add client)' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Create a new user with profile information',
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email is already taken' })
  @MinRoleLevel(EUserLevels[EUserRole.TRAINER])
  @Post()
  create(@AuthUser() user: any, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto, user);
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Update user and profile information',
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @MinRoleLevel(EUserLevels[EUserRole.TRAINER])
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @AuthUser() currentUser: any
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @MinRoleLevel(EUserLevels[EUserRole.TRAINER])
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() currentUser: any
  ) {
    return this.usersService.remove(id, currentUser);
  }

  @ApiOperation({ summary: 'Reset authenticated user password' })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Reset user password',
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @MinRoleLevel(EUserLevels[EUserRole.SUPER_ADMIN])
  @Put('me/reset-password')
  resetPassword(
    @AuthUser() user: any,
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    const id = user.id;
    return this.usersService.resetPassword(id, resetPasswordDto);
  }

}
