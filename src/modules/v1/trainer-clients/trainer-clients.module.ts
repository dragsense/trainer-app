import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainerClientsService } from './trainer-clients.service';
import { TrainerClientsController } from './trainer-clients.controller';
import { TrainerClient } from 'shared/entities';
import { User } from 'shared/entities';

@Module({
  imports: [TypeOrmModule.forFeature([TrainerClient, User])],
  controllers: [TrainerClientsController],
  providers: [TrainerClientsService],
  exports: [TrainerClientsService],
})
export class TrainerClientsModule {}
