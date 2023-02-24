import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGoalInput } from './dto/create-goal.input';
import { UpdateGoalInput } from './dto/update-goal.input';
import { Goal } from './entities/goal.entity';
import { Repository } from 'typeorm';

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

  findOne({ id }: { id: string }) {
    return this.goalRepository.findOne({ where: { id } });
  }

  // findOne(id: number) {
  //   return 2;
  // }

  // update(id: number, updateGoalInput: UpdateGoalInput) {
  //   return `This action updates a #${id} goal`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} goal`;
  // }
}
