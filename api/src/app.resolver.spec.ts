import { EmailVerification } from './users/entities/email-verification.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AppResolver } from './app.resolver';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { User } from './users/entities/user.entity';
import { LoginUserInput } from './users/dto/login-user.input';
import { Auth } from './auth/entities/auth.entity';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { ResetPassword } from './users/entities/reset-password.entity';

const moduleMocker = new ModuleMocker(global);

describe('AppResolver', () => {
  let resolver: AppResolver;
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppResolver],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    resolver = module.get<AppResolver>(AppResolver);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('whoAmI', () => {
    it('should return a user', async () => {
      const mockUser: User = {
        id: '1',
        username: 'testuser',
        password: 'testpassword',
        email: 'email@email.com',
        emailVerification: new EmailVerification(),
        resetPassword: new ResetPassword(),
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
        email: 'testuser@test.com',
        password: 'testpassword',
      };

      const mockAuth: Auth = {
        token: 'testjwt',
        user: new User(),
      };

      jest.spyOn(authService, 'login').mockImplementation(async () => ({
        access_token: mockAuth.token,
        user: mockAuth.user,
      }));

      const result = await resolver.login(mockLoginInput);

      expect(result).toEqual({ token: mockAuth.token, user: mockAuth.user });
    });

    it('should throw an error when invalid credentials are provided', async () => {
      const mockLoginInput: LoginUserInput = {
        email: 'testuser@test.com',
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

  describe('register', () => {
    it('should register user and return token', async () => {
      const user = new User();
      jest
        .spyOn(authService, 'register')
        .mockResolvedValue({ accessToken: 'token', user });

      const result = await resolver.register({
        username: 'testuser',
        password: 'testpass',
        email: 'test@test.com',
      });

      expect(result).toEqual({ token: 'token', user });
    });
  });
});
