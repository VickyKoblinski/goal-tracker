import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export default class Handlers {
  constructor(private app: INestApplication, private token?: string) {}

  private wrapper(body) {
    return request(this.app.getHttpServer())
      .post('/graphql')
      .send(body)
      .set('Accept', 'application/json')
      .set('Authorization', this.token ? 'Bearer ' + this.token : '');
  }

  login(loginUserInput) {
    return this.wrapper({
      query: `
      mutation Login($loginUserInput: LoginUserInput!) {
        login(loginUserInput: $loginUserInput) {
          token
        }
      }
      `,
      variables: { loginUserInput },
    });
  }

  register(createUserInput) {
    return this.wrapper({
      query: `
      mutation Register($createUserInput: CreateUserInput!) {
        register(createUserInput: $createUserInput) {
          token
        }
      }
      `,
      variables: { createUserInput },
    });
  }

  verify(emailVerificationToken) {
    return this.wrapper({
      query: `
      mutation VerifyEmail($emailVerificationToken: String!) {
        verifyEmail(emailVerificationToken: $emailVerificationToken) {
          id
        }
      }
      `,
      variables: { emailVerificationToken },
    });
  }

  whoAmI() {
    return this.wrapper({
      query: `
          query WhoAmI {
            whoAmI {
              id
              username
              email
            }
          }
      `,
    });
  }

  resetPassword(email) {
    return this.wrapper({
      query: `
      mutation ResetPassword($email: String!) {
        createResetPassword(email: $email) {
          resetPassword {
            id
          }
        }
      }
      `,
      variables: { email },
    });
  }

  submitResetPassword(submitResetPasswordInput) {
    return this.wrapper({
      query: `
      mutation SubmitResetPassword($submitResetPasswordInput: SubmitResetPasswordInput!) {
        submitResetPassword(submitResetPasswordInput: $submitResetPasswordInput) {
          id
        }
      }
      `,
      variables: { submitResetPasswordInput },
    });
  }
}
