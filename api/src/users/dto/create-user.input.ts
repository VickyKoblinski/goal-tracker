import { LoginUserInput } from './login-user.input';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput extends LoginUserInput {
  @Field(() => String, { description: 'Username' })
  username: string;
}
