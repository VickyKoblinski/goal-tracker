import { Injectable } from '@nestjs/common';
import { CreateGoalInput } from './dto/create-goal.input';
import { UpdateGoalInput } from './dto/update-goal.input';

@Injectable()
export class GoalsService {
  create(createGoalInput: CreateGoalInput) {
    return 'This action adds a new goal';
  }

  findAll() {
    return [{ exampleField: 1 }];
  }

  findOne(id: number) {
    return 2;
  }

  update(id: number, updateGoalInput: UpdateGoalInput) {
    return `This action updates a #${id} goal`;
  }

  remove(id: number) {
    return `This action removes a #${id} goal`;
  }
}
