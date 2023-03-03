import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class LoginUserInput {
  @Field(() => String, { description: 'Email' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field(() => String, { description: 'Password' })
  @IsNotEmpty()
  password: string;
}
