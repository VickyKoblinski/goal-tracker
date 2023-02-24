import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AppResolver } from './app.resolver';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { User } from './users/entities/user.entity';
import { LoginUserInput } from './users/dto/login-user.input';
import { Auth } from './auth/entities/auth.entity';

describe('AppResolver', () => {
  let resolver: AppResolver;
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppResolver, UsersService, AuthService, JwtService],
    }).compile();

    resolver = module.get<AppResolver>(AppResolver);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('whoAmI', () => {
    it('should return a user', async () => {
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        password: 'testpassword',
      };

      jest
        .spyOn(usersService, 'findOne')
        .mockImplementation(async () => mockUser);

      const result = await resolver.whoAmI(mockUser);

      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should return an auth object', async () => {
      const mockLoginInput: LoginUserInput = {
        username: 'testuser',
        password: 'testpassword',
      };

      const mockAuth: Auth = {
        token: 'testjwt',
      };

      jest.spyOn(authService, 'login').mockImplementation(async () => ({
        access_token: mockAuth.token,
      }));

      const result = await resolver.login(mockLoginInput);

      expect(result).toEqual({ token: mockAuth.token });
    });

    it('should throw an error when invalid credentials are provided', async () => {
      const mockLoginInput: LoginUserInput = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      jest.spyOn(authService, 'login').mockImplementation(async () => {
        throw new Error('Invalid credentials');
      });

      await expect(resolver.login(mockLoginInput)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
