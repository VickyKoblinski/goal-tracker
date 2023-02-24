import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateGoalInput {
  @Field({ description: 'Name of the goal' })
  name: string;

  @Field(() => ID, { description: 'The parent goal', nullable: true })
  parent?: string;
}
