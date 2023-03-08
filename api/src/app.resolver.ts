import { SubmitResetPasswordInput } from './users/dto/submit-reset-password.input';
import { EmailVerification } from './users/entities/email-verification.entity';
import { CreateUserInput } from './users/dto/create-user.input';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users/users.service';
import { User } from './users/entities/user.entity';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { CurrentUser } from './decorators/CurrentUser.decorator';
import {
  GqlAuthGuardNoValidation,
  LocalGqlAuthGuard,
} from './auth/gql-auth.guard';
import { AuthService } from './auth/auth.service';
import { LoginUserInput } from './users/dto/login-user.input';
import { Auth } from './auth/entities/auth.entity';

@Resolver(() => User)
export class AppResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Query((returns) => User)
  @UseGuards(GqlAuthGuardNoValidation)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(LocalGqlAuthGuard)
  @Mutation(() => Auth)
  async login(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    const login = await this.authService.login(loginUserInput);
    return { token: login.access_token, user: login.user };
  }

  @Mutation(() => Auth)
  async register(@Args('createUserInput') createUserInput: CreateUserInput) {
    const login = await this.authService.register(createUserInput);
    return { token: login.accessToken, user: login.user };
  }

  @Mutation(() => EmailVerification)
  @UseGuards(GqlAuthGuardNoValidation)
  async verifyEmail(
    @CurrentUser() user: User,
    @Args('emailVerificationToken') emailVerificationToken: string,
  ) {
    if (!emailVerificationToken)
      throw new BadRequestException('Email verification code cannot be empty');
    const emailVerification = await this.authService.validateEmail(
      user,
      emailVerificationToken,
    );
    return emailVerification;
  }

  @Mutation(() => User)
  async createResetPassword(@Args('email') email: string) {
    if (!email) throw new BadRequestException('Email cannot be empty');

    return this.authService.resetPassword(email);
  }

  @Mutation(() => User)
  async submitResetPassword(
    @Args('submitResetPasswordInput')
    submitResetPasswordInput: SubmitResetPasswordInput,
  ) {
    return this.authService.submitResetPassword(submitResetPasswordInput);
  }
}
