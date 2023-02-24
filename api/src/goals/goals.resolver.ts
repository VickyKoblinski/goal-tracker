import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
  ID,
} from '@nestjs/graphql';
import { GoalsService } from './goals.service';
import { Goal } from './entities/goal.entity';
import { CreateGoalInput } from './dto/create-goal.input';
import { UpdateGoalInput } from './dto/update-goal.input';
import { DeleteGoalInput } from './dto/delete-goal.input';

@Resolver(() => Goal)
export class GoalsResolver {
  constructor(private readonly goalsService: GoalsService) {}

  @Mutation(() => Goal)
  createGoal(@Args('createGoalInput') createGoalInput: CreateGoalInput) {
    return this.goalsService.create(createGoalInput);
  }

  @Query(() => [Goal], { name: 'goals' })
  findAll() {
    return this.goalsService.findAll();
  }

  @ResolveField('parent', (returns) => Goal)
  parent(@Parent() goal: Goal) {
    if (!goal.parentId) return null;
    return this.goalsService.findOne(goal.parentId);
  }

  @ResolveField('children', (returns) => [Goal])
  children(@Parent() goal: Goal) {
    return this.goalsService.findAllChildren(goal.id);
  }

  @Query(() => Goal, { name: 'goal' })
  findOne(@Args('id', { type: () => ID }) id: number) {
    return this.goalsService.findOne(id);
  }

  // @Mutation(() => Goal)
  // updateGoal(@Args('updateGoalInput') updateGoalInput: UpdateGoalInput) {
  //   return this.goalsService.update(updateGoalInput.id, updateGoalInput);
  // }

  @Mutation(() => Goal)
  deleteGoal(@Args('deleteGoalInput') deleteGoalInput: DeleteGoalInput) {
    return this.goalsService.remove(deleteGoalInput);
  }
}
