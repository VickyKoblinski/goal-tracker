import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/app.module';
import Handlers from './app.handlers';
import sendgridHandler from './sendgrid.handler';

describe('App resolvers (supertest)', () => {
  let app: INestApplication;
  let unauthHandlers: Handlers;
  let authHandlers: Handlers;
  const createUserInput = {
    username: 'john',
    password: 'changeme',
    email: 'john-changeme@gmail.com',
  };

  beforeAll(async () => {
    app = await createTestApp();
    unauthHandlers = new Handlers(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('register', () => {
    beforeEach(async () => {
      await sendgridHandler.delete();
    });

    it('creates a new user', async () => {
      const res = await unauthHandlers.register(createUserInput);

      const { data } = res.body;
      expect(data.register.token).toBeDefined();
      const emailRes = await sendgridHandler.get();
      const body = emailRes.body[0];
      const sentTo = body.personalizations[0];
      expect(sentTo.to[0].email).toBe(createUserInput.email);
      expect(sentTo.dynamic_template_data.verificationToken).toBeDefined();
      expect(body.template_id).toBeDefined();
    });

    it.skip('cannot create a new user with a shared username', () => {
      // TODO
    });
  });

  describe('login', () => {
    it('get jwt from valid login', async () => {
      const { email, ...loginUserInput } = createUserInput;
      const res = await unauthHandlers.login(loginUserInput);

      const { data } = res.body;

      expect(data.login.token).toBeDefined();
      authHandlers = new Handlers(app, data.login.token);
    });

    it('get error from invalid login', async () => {
      const loginUserInput = {
        username: 'john',
        password: 'changeme2',
      };

      const res = await unauthHandlers.login(loginUserInput);
      const { errors } = res.body;

      expect(errors[0].message).toBe('Unauthorized');
    });
  });

  describe('whoAmI', () => {
    it('returns current user', async () => {
      const res = await authHandlers.whoAmI();
      expect(res.body.data.whoAmI.username).toEqual('john');
      expect(typeof res.body.data.whoAmI.id).toBe('string');
    });

    it('is unauthorized if bad token is sent', async () => {
      const res = await unauthHandlers.whoAmI();
      const { errors } = res.body;

      expect(errors[0].message).toBe('Unauthorized');
    });
  });
});

async function createTestApp() {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return app;
}
