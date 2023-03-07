import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SubmitResetPasswordInput {
  @Field(() => String, { description: 'Username' })
  email: string;

  @Field(() => String, { description: 'New password' })
  newPassword: string;

  @Field(() => String, { description: 'Email verification token' })
  emailVerificationToken: string;
}
