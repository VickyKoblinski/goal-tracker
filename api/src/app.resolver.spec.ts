import { MailerService } from '@nestjs-modules/mailer';
import { EmailVerification } from './users/entities/email-verification.entity';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AppResolver } from './app.resolver';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { User } from './users/entities/user.entity';
import { LoginUserInput } from './users/dto/login-user.input';
import { Auth } from './auth/entities/auth.entity';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('AppResolver', () => {
  let resolver: AppResolver;
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppResolver,
        UsersService,
        AuthService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(EmailVerification),
          useClass: Repository,
        },
        {
          provide: MailerService,
          useValue: {},
        },
        {
          provide: getDataSourceToken(),
          useValue: {},
        },
      ],
    }).compile();

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
        emailVerification: new EmailVerification(),
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

  describe('register', () => {
    it('should register user and return token', async () => {
      jest
        .spyOn(authService, 'register')
        .mockResolvedValue({ access_token: 'token' });

      const result = await resolver.register({
        username: 'testuser',
        password: 'testpass',
      });

      expect(result).toEqual({ token: 'token' });
    });
  });
});
