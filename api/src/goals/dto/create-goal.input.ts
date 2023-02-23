import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateGoalInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
