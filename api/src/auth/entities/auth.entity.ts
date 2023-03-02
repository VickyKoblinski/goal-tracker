import { User } from '@/users/entities/user.entity';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Auth {
  @Field(() => String, { description: 'JWT Access Token' })
  token: string;

  @Field(() => User, { description: 'This user' })
  user: User;
}
