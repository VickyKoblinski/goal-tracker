import { LoginUserInput } from './login-user.input';
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class CreateUserInput extends LoginUserInput {
  @IsEmail()
  @Field(() => String, { description: 'Email address' })
  email: string;
}
