import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID, { description: 'User ID' })
  id: number;

  @Field(() => ID, { description: 'Username' })
  username: string;

  @Field(() => ID, { description: 'Password' })
  password: string;
}
