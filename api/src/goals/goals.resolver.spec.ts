import { Test, TestingModule } from '@nestjs/testing';
import { GoalsResolver } from './goals.resolver';
import { GoalsService } from './goals.service';
import { Goal } from './entities/goal.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('GoalsResolver', () => {
  let resolver: GoalsResolver;
  let service: GoalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsResolver,
        GoalsService,
        {
          provide: getRepositoryToken(Goal),
          useClass: Repository,
        },
      ],
    }).compile();

    resolver = module.get<GoalsResolver>(GoalsResolver);
    service = module.get<GoalsService>(GoalsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createGoal', () => {
    it('should create and return a goal', async () => {
      const mockGoal = new Goal();
      const createGoalInput = { name: 'My first goal' };
      jest.spyOn(service, 'create').mockResolvedValue(mockGoal);
      const result = await resolver.createGoal(createGoalInput);
      expect(result).toBe(mockGoal);
      expect(service.create).toHaveBeenCalledWith(createGoalInput);
    });
  });

  describe('findAll', () => {
    it('should return an array of goals', async () => {
      const mockGoals = [new Goal(), new Goal()];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockGoals);
      const result = await resolver.findAll();
      expect(result).toBe(mockGoals);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
