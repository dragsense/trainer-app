import { Controller, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { Profile } from './entities/profile.entity';
import { FileUploadModule } from '../../file-upload/file-upload.module';

@Module({
    imports: [TypeOrmModule.forFeature([Profile]), FileUploadModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
