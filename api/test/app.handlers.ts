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
}
