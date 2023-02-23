import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateGoalInput {
  @Field({ description: 'Name of the goal' })
  name: string;
}
