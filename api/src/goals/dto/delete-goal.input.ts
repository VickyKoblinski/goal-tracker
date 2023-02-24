import { InputType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum DeleteGoalStrategy {
  RECURSIVE = 'recursive',
  ORPHAN = 'orphan',
}

registerEnumType(DeleteGoalStrategy, {
  name: 'DeleteGoalStrategy',
});

@InputType()
export class DeleteGoalInput {
  @Field(() => ID)
  id: number;

  @Field(() => DeleteGoalStrategy, { nullable: true })
  deletionStrategy?: DeleteGoalStrategy;
}
