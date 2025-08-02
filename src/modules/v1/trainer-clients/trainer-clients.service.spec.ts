import { Test, TestingModule } from '@nestjs/testing';
import { TrainerClientsService } from './trainer-clients.service';

describe('TrainerClientsService', () => {
  let service: TrainerClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainerClientsService],
    }).compile();

    service = module.get<TrainerClientsService>(TrainerClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
