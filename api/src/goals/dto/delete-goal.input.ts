import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class DeleteGoalInput {
  @Field(() => ID)
  id: number;

  @Field(() => Boolean, { defaultValue: false })
  recursive?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  orphan?: boolean;
}
