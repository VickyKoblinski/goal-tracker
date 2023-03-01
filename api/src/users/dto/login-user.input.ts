import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class LoginUserInput {
  @Field(() => String, { description: 'Username' })
  @IsNotEmpty()
  username: string;

  @Field(() => String, { description: 'Password' })
  @IsNotEmpty()
  password: string;
}
