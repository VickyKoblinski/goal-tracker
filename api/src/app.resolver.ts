import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users/users.service';
import { User } from './users/entities/user.entity';
import { UseGuards } from '@nestjs/common';
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
  async register(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    const login = await this.authService.register(loginUserInput);
    return { token: login.access_token };
  }
}
