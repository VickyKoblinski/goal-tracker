import { Test, TestingModule } from '@nestjs/testing';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return the user with the specified username', async () => {
      const username = 'john';

      const expectedUser: User = {
        id: 1,
        username: 'john',
        password:
          '$2b$10$Dot1qjkYa5IXEs80gzTWQ.Xw.IFgcYat31FhCGIL1m3MueNO9Fxde',
      };

      const result = await service.findOne(username);

      expect(result).toEqual(expectedUser);
    });

    it('should return undefined if the user is not found', async () => {
      const username = 'nonexistent';

      const result = await service.findOne(username);

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('creates a new user', async () => {
      const newUser = await service.create({
        username: 'testuser',
        password: 'testpass',
      });
      expect(newUser).toMatchObject({
        username: 'testuser',
        password: 'testpass',
        id: 2,
      });
    });
  });
});
