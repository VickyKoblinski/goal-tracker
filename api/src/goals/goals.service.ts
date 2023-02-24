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
import { DeleteGoalInput } from './dto/delete-goal.input';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
  ) {}

  async create(createGoalInput: CreateGoalInput) {
    const params: Partial<Goal> = {
      name: createGoalInput.name,
    };

    if (createGoalInput.parent) {
      const parent = await this.goalRepository.findOne({
        where: { id: createGoalInput.parent },
      });
      if (!parent) throw new NotFoundException('parent goal not found');
      params.parent = parent;
    }

    const goal = this.goalRepository.create(params);
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

  async remove(
    { id, recursive, orphan }: DeleteGoalInput, // { recursive, orphan }: { recursive: boolean; orphan: boolean },
  ) {
    const parentEntity = await this.goalRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!parentEntity) throw new NotFoundException('goal not found');

    const children = await this.goalRepository.find({
      where: { parentId: id },
    });

    if (children.length) {
      if (!recursive)
        throw new MethodNotAllowedException(
          'cannot delete goal with children, use FORCE or CASCADE to delete',
        );

      await Promise.all(children.map(({ id }) => this.remove({ id })));
    }

    const clone = Object.assign({}, parentEntity);

    // const goal = await this.findOne(id);
    // if (!goal) {
    //   throw new NotFoundException('goal not found');
    // }
    // if (goal.children.length) {
    //   // cannot delete a goal that has children unless recursive or orphan is true
    // }
    // If goal is a child, remove it from it's parent

    await this.goalRepository.remove(parentEntity);
    return clone;
  }
}
