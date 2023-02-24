import {
  Injectable,
  NotFoundException,
  MethodNotAllowedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGoalInput } from './dto/create-goal.input';
import { UpdateGoalInput } from './dto/update-goal.input';
import { Goal } from './entities/goal.entity';
import { Repository } from 'typeorm';
import { DeleteGoalInput, DeleteGoalStrategy } from './dto/delete-goal.input';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
  ) {}

  async create(createGoalInput: CreateGoalInput) {
    // Extract name property from the provided input
    const params: Partial<Goal> = {
      name: createGoalInput.name,
    };

    // If a parent goal ID is provided, find the parent goal entity in the database
    if (createGoalInput.parent) {
      const parent = await this.goalRepository.findOne({
        where: { id: createGoalInput.parent },
      });

      // Throw a NotFoundException if the parent goal entity is not found
      if (!parent) throw new NotFoundException('parent goal not found');

      // Assign the parent goal entity to the new goal's parent property
      params.parent = parent;
    }

    // Create a new Goal entity with the extracted properties
    const goal = this.goalRepository.create(params);

    // Save the new Goal entity to the database and return it
    return this.goalRepository.save(goal);
  }

  findAll() {
    return this.goalRepository.find();
  }

  findAllChildren(parentId: number) {
    return this.goalRepository.find({ where: { parentId } });
  }

  findOne(id: number) {
    return this.goalRepository.findOne({ where: { id } });
  }

  // update(id: number, updateGoalInput: UpdateGoalInput) {
  //   return `This action updates a #${id} goal`;
  // }

  async remove({ id, deletionStrategy }: DeleteGoalInput) {
    // Find the parent Goal entity with the provided ID, including its children relations
    const parentEntity = await this.goalRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    // If no parent Goal entity is found, throw a NotFoundException
    if (!parentEntity) {
      throw new NotFoundException('goal not found');
    }

    // If deletionStrategy is RECURSIVE and there are child entities, recursively remove them
    if (deletionStrategy === DeleteGoalStrategy.RECURSIVE) {
      const children = parentEntity.children;
      if (children.length) {
        await Promise.all(
          children.map((child) =>
            this.remove({ id: child.id, deletionStrategy }),
          ),
        );
      }
    }

    // If deletionStrategy is ORPHAN and there are child entities, update their parent to null
    if (deletionStrategy === DeleteGoalStrategy.ORPHAN) {
      const children = parentEntity.children;
      if (children.length) {
        await this.goalRepository.update(
          { parent: parentEntity },
          { parent: null },
        );
      }
    }

    // If there are child entities and neither flag is set, throw a MethodNotAllowedException
    if (parentEntity.children.length && !deletionStrategy) {
      throw new MethodNotAllowedException(
        'cannot delete goal with children, use FORCE or CASCADE to delete',
      );
    }

    // Clone the parent entity object to return before it's deleted
    const clone = Object.assign({}, parentEntity);

    // Remove the parent Goal entity from the database and return the cloned object
    await this.goalRepository.remove(parentEntity);
    return clone;
  }
}
