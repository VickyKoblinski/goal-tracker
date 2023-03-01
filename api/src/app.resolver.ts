import { EmailVerification } from './users/entities/email-verification.entity';
import { CreateUserInput } from './users/dto/create-user.input';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users/users.service';
import { User } from './users/entities/user.entity';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { CurrentUser } from './decorators/CurrentUser.decorator';
import { GqlAuthGuard, LocalGqlAuthGuard } from './auth/gql-auth.guard';
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
  @UseGuards(GqlAuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return this.usersService.findOne(user.username);
  }

  @UseGuards(LocalGqlAuthGuard)
  @Mutation(() => Auth)
  async login(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    const login = await this.authService.login(loginUserInput);
    return { token: login.access_token };
  }

  @Mutation(() => Auth)
  async register(@Args('createUserInput') createUserInput: CreateUserInput) {
    const login = await this.authService.register(createUserInput);
    return { token: login.access_token };
  }

  @Mutation(() => EmailVerification)
  async verifyEmail(
    @Args('emailVerificationToken') emailVerificationToken: string,
  ) {
    if (!emailVerificationToken)
      throw new BadRequestException('Email verification code cannot be empty');
    const emailVerification = await this.authService.validateEmail(
      emailVerificationToken,
    );
    return emailVerification;
  }
}
