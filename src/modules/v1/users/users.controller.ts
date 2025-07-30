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
} from './dto/user-responses.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';
import { UserRole, UserLevels } from '@/modules/v1/users/enums/user.enum';
import { RoleLevelGuard } from '@/guards/level.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserListDto } from './dto/user-list.dto';

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
  @MinRoleLevel(UserLevels[UserRole.TRAINER])
  @Get()
  findAll(
    @Query() query: UserListDto,
    @AuthUser() user: any
  ) {
    return this.usersService.findAll(query, user);
  }

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
  @MinRoleLevel(UserLevels[UserRole.TRAINER])
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() currentUser: any
  ) {
    return this.usersService.findOne(
      { id },
      { select: ['id', 'email', 'level'], relations: ['profile'] }
    );
  }

  @ApiOperation({ summary: 'Add a new user (Admin: add trainer/client, Trainer: add client)' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Create a new user with profile information',
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email is already taken' })
  @MinRoleLevel(UserLevels[UserRole.TRAINER])
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
  @MinRoleLevel(UserLevels[UserRole.TRAINER])
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
  @MinRoleLevel(UserLevels[UserRole.ADMIN])
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() currentUser: any
  ) {
    return this.usersService.remove(id, currentUser);
  }

  @ApiOperation({ summary: 'Reset user password' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Reset user password',
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @MinRoleLevel(UserLevels[UserRole.TRAINER])
  @Put(':id/reset-password')
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    return this.usersService.resetPassword(id, resetPasswordDto);
  }
}
