import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn<User, []>(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user object if credentials are valid', async () => {
      const user = new User();
      user.id = 1;
      user.username = 'testuser';
      user.password = 'testpass';
      const findOneSpy = jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValue(user);

      const result = await authService.validateUser('testuser', 'testpass');

      expect(findOneSpy).toHaveBeenCalledWith('testuser');
      expect(result).toEqual({ username: user.username, id: user.id });
    });

    it('should return null if credentials are invalid', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      const result = await authService.validateUser('testuser', 'testpass');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate a JWT token', async () => {
      const signSpy = jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await authService.login({
        username: 'testuser',
        userId: 1,
      });

      expect(signSpy).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 1,
      });
      expect(result).toEqual({ access_token: 'token' });
    });
  });
});
