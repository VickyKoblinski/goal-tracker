import { Test } from '@nestjs/testing';
import { GoalsService } from './goals.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './entities/goal.entity';
import { MethodNotAllowedException, NotFoundException } from '@nestjs/common';
import { DeleteGoalStrategy } from './dto/delete-goal.input';

describe('GoalsService', () => {
  let goalsService: GoalsService;
  let goalRepository: Repository<Goal>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: getRepositoryToken(Goal),
          useClass: Repository,
        },
      ],
    }).compile();

    goalsService = moduleRef.get<GoalsService>(GoalsService);
    goalRepository = moduleRef.get<Repository<Goal>>(getRepositoryToken(Goal));
  });

  it('should be defined', () => {
    expect(goalsService).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a goal', async () => {
      const mockGoal = new Goal();
      const createGoalInput = { name: 'my goal' };
      jest.spyOn(goalRepository, 'create').mockReturnValue(mockGoal);
      jest.spyOn(goalRepository, 'save').mockResolvedValue(mockGoal);
      const result = await goalsService.create(createGoalInput);
      expect(result).toBe(mockGoal);
      expect(goalRepository.create).toHaveBeenCalledWith(createGoalInput);
      expect(goalRepository.save).toHaveBeenCalledWith(mockGoal);
    });

    it('should create a goal with a parent', async () => {
      const mockGoal = new Goal();
      const mockParent = new Goal();

      const createGoalInput = { name: 'my goal', parent: 7 };
      jest.spyOn(goalRepository, 'create').mockReturnValue(mockGoal);
      jest.spyOn(goalRepository, 'save').mockResolvedValue(mockGoal);
      jest.spyOn(goalRepository, 'findOne').mockResolvedValue(mockParent);
      const result = await goalsService.create(createGoalInput);
      expect(result).toBe(mockGoal);
      expect(goalRepository.create).toHaveBeenCalledWith({
        ...createGoalInput,
        parent: mockParent,
      });
      expect(goalRepository.save).toHaveBeenCalledWith(mockGoal);
    });

    it('throw error if parent is not found', async () => {
      const mockGoal = new Goal();

      const createGoalInput = { name: 'my goal', parent: 7 };
      jest.spyOn(goalRepository, 'create').mockReturnValue(mockGoal);
      jest.spyOn(goalRepository, 'save').mockResolvedValue(mockGoal);
      jest.spyOn(goalRepository, 'findOne').mockResolvedValue(null);

      await expect(goalsService.create(createGoalInput)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of goals', async () => {
      const mockGoals = [new Goal(), new Goal()];
      jest.spyOn(goalRepository, 'find').mockResolvedValue(mockGoals);
      const result = await goalsService.findAll();
      expect(result).toBe(mockGoals);
      expect(goalRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAllChildren', () => {
    it('should return an array of goals', async () => {
      const mockGoals = [new Goal(), new Goal()];
      jest.spyOn(goalRepository, 'find').mockResolvedValue(mockGoals);
      const result = await goalsService.findAllChildren(7);
      expect(result).toBe(mockGoals);
      expect(goalRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should a goal', async () => {
      const mockGoal = new Goal();
      jest.spyOn(goalRepository, 'findOne').mockResolvedValue(mockGoal);
      const result = await goalsService.findOne(7);
      expect(result).toBe(mockGoal);
      expect(goalRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('Removes entity and returns a copy', async () => {
      const mockGoal = new Goal();
      mockGoal.id = 1;
      mockGoal.children = [];
      jest.spyOn(goalRepository, 'findOne').mockResolvedValue(mockGoal);
      jest.spyOn(goalRepository, 'remove').mockResolvedValue(null);
      const result = await goalsService.remove({ id: 1 });
      expect(result).not.toBe(mockGoal);
      expect(result).toMatchObject(mockGoal);
      expect(goalRepository.findOne).toHaveBeenCalled();
      expect(goalRepository.remove).toHaveBeenCalled();
    });

    it('Throws an error if the goal has children', async () => {
      const mockGoal = new Goal();
      mockGoal.id = 1;
      mockGoal.children = [new Goal()];
      jest.spyOn(goalRepository, 'findOne').mockResolvedValue(mockGoal);
      jest.spyOn(goalRepository, 'remove').mockResolvedValue(null);
      await expect(goalsService.remove({ id: 1 })).rejects.toThrow(
        MethodNotAllowedException,
      );
    });

    it('recursively removes children', async () => {
      const mockGoal = new Goal();
      mockGoal.id = 1;
      const mockChildGoal = new Goal();
      mockChildGoal.id = 2;
      mockChildGoal.children = [];
      mockGoal.children = [mockChildGoal];
      jest
        .spyOn(goalRepository, 'findOne')
        .mockResolvedValueOnce(mockGoal)
        .mockResolvedValueOnce(mockChildGoal);
      jest.spyOn(goalRepository, 'remove').mockResolvedValue(null);
      await goalsService.remove({
        id: 1,
        deletionStrategy: DeleteGoalStrategy.RECURSIVE,
      });
    });

    it('removes orphaned children', async () => {
      const mockGoal = new Goal();
      mockGoal.id = 1;
      const mockChildGoal = new Goal();
      mockChildGoal.id = 2;
      mockChildGoal.children = [];
      mockGoal.children = [mockChildGoal];
      jest.spyOn(goalRepository, 'findOne').mockResolvedValue(mockGoal);
      jest.spyOn(goalRepository, 'update').mockResolvedValue(null);
      jest.spyOn(goalRepository, 'remove').mockResolvedValue(null);
      await goalsService.remove({
        id: 1,
        deletionStrategy: DeleteGoalStrategy.ORPHAN,
      });
    });

    it('throws an error if parent entity is not found', async () => {
      jest.spyOn(goalRepository, 'findOne').mockResolvedValue(null);
      await expect(
        goalsService.remove({
          id: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
