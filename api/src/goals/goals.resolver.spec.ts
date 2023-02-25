import { Test, TestingModule } from '@nestjs/testing';
import { GoalsResolver } from './goals.resolver';
import { GoalsService } from './goals.service';
import { Goal } from './entities/goal.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ID } from '@nestjs/graphql';

describe('GoalsResolver', () => {
  let resolver: GoalsResolver;
  let service: GoalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsResolver,
        GoalsService,
        // {
        //   provide: GoalsService,
        //   useValue: {
        //     findOne: jest.fn(),
        //   },
        // },
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

  describe.skip('findOne', () => {
    const id = 1;

    it('should call GoalsService.findOne with the provided ID', async () => {
      await resolver.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it('should return the result of GoalsService.findOne', async () => {
      const expectedResult = new Goal();
      expectedResult.id = id;
      expectedResult.name = 'test goal';
      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      const result = await resolver.findOne(id);
      expect(result).toEqual(expectedResult);
    });
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

  describe('findOne', () => {
    it('should return one Goal', async () => {
      const mockGoal = new Goal();
      jest.spyOn(service, 'findOne').mockResolvedValue(mockGoal);
      const result = await resolver.findOne(1);
      expect(result).toBe(mockGoal);
      expect(service.findOne).toHaveBeenCalled();
    });
  });

  describe('children', () => {
    it('should return the children', async () => {
      const mockChildren = [new Goal()];
      jest.spyOn(service, 'findAllChildren').mockResolvedValue(mockChildren);
      const result = await resolver.children(new Goal());
      expect(result).toBe(mockChildren);
      expect(service.findAllChildren).toHaveBeenCalled();
    });
  });

  describe('parent', () => {
    it('should return the parent', async () => {
      const mockParent = new Goal();
      const mockRoot = new Goal();
      mockRoot.parentId = 7;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockParent);
      const result = await resolver.parent(mockRoot);
      expect(result).toBe(mockParent);
      expect(service.findOne).toHaveBeenCalled();
    });

    it('should return null when parentId is not defined', async () => {
      const mockParent = new Goal();
      const mockRoot = new Goal();

      jest.spyOn(service, 'findOne').mockResolvedValue(mockParent);
      const result = await resolver.parent(mockRoot);
      expect(result).toBe(null);
      expect(service.findOne).not.toHaveBeenCalled();
    });
  });
});
