import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '@/modules/v1/users/users.service';


@Injectable()
export class SuperAdminSeeder implements OnApplicationBootstrap {
  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.usersService.createSuperAdminIfNotExists();
  }
}
 