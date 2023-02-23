import { Injectable } from '@nestjs/common';
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

  create(createGoalInput: CreateGoalInput) {
    const goal = this.goalRepository.create(createGoalInput);
    return this.goalRepository.save(goal);
  }

  findAll() {
    return this.goalRepository.find();
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
