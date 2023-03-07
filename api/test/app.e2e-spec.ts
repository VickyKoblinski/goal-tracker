import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/app.module';
import Handlers from './app.handlers';
import sendgridHandler from './sendgrid.handler';
import * as request from 'supertest';

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
      const { username, ...loginUserInput } = createUserInput;
      const res = await unauthHandlers.login(loginUserInput);

      const { data } = res.body;

      expect(data.login.token).toBeDefined();
      authHandlers = new Handlers(app, data.login.token);
    });

    it('get error from invalid login', async () => {
      const loginUserInput = {
        email: 'john@j.com',
        password: 'changeme2',
      };

      const res = await unauthHandlers.login(loginUserInput);
      const { errors } = res.body;

      expect(errors[0].message).toBe('Unauthorized');
    });
  });

  describe('whoAmI', () => {
    it('returns current user even if not validated email', async () => {
      const res = await authHandlers.whoAmI();

      expect(res.body.data.whoAmI.username).toEqual('john');
    });

    it('verifies email', async () => {
      const emailRes = await sendgridHandler.get();
      const token =
        emailRes.body[0].personalizations[0].dynamic_template_data
          .verificationToken;
      const res = await authHandlers.verify(token);
      expect(res.body.data.verifyEmail.id.length).toBeGreaterThan(0);
    });

    it('is unauthorized if bad token is sent', async () => {
      const res = await unauthHandlers.whoAmI();
      const { errors } = res.body;

      expect(errors[0].message).toBe('Unauthorized');
    });
  });

  describe('resetPassword', () => {
    it('sends email to reset password', async () => {
      const user = {
        username: 'test',
        email: 'resetPassword@test.com',
        password: 'pass',
      };
      await unauthHandlers.register(user);
      const res = await unauthHandlers.resetPassword(user.email);
      expect(res.body.data.resetPassword.resetPassword.id).toBeDefined();
      const emailRes = await sendgridHandler.get();
      const email = emailRes.body.find(
        (item) => item.template_id === 'd-verifyEmail',
      );
      expect(email.personalizations[0].to[0].email).toEqual(user.email);
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
