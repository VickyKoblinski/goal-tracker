import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export default class Handlers {
  constructor(private app: INestApplication) {}

  private wrapper(body) {
    return request(this.app.getHttpServer())
      .post('/graphql')
      .send(body)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  }

  createGoal(createGoalInput) {
    return this.wrapper({
      query: `
        mutation CreateGoal($createGoalInput: CreateGoalInput!) {
          createGoal(createGoalInput: $createGoalInput) {
            id
            name
            parent {
              name
            }
          }
        }
      `,
      variables: { createGoalInput },
    });
  }

  findGoal(variables: { id: string | number }) {
    return this.wrapper({
      query: `
          query FindGoal($id: ID!) {
            goal(id: $id) {
              id
              name
              children {
                name
                id
              }
              parent {
                id
              }
            }
          }
        `,
      variables,
    });
  }

  findAllGoals() {
    return this.wrapper({
      query: `
        query FindAllGoals {
          goals {
            id
            name
          }
        }
      `,
    });
  }

  deleteGoal(deleteGoalInput) {
    return this.wrapper({
      query: `
        mutation DeleteGoal($deleteGoalInput: DeleteGoalInput!) {
          deleteGoal(deleteGoalInput: $deleteGoalInput) {
            id
          }
        }
      `,
      variables: { deleteGoalInput },
    });
  }
}
