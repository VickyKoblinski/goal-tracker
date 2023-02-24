import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Auth {
  @Field(() => String, { description: 'JWT Access Token' })
  jwt: string;
}
