import { Test, TestingModule } from '@nestjs/testing';
import { TrainerClientsController } from './trainer-clients.controller';
import { TrainerClientsService } from './trainer-clients.service';

describe('TrainerClientsController', () => {
  let controller: TrainerClientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainerClientsController],
      providers: [TrainerClientsService],
    }).compile();

    controller = module.get<TrainerClientsController>(TrainerClientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
