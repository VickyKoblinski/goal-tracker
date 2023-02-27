import * as request from 'supertest';

describe('Goal resolvers (supertest)', () => {
  it('connects to sendgrid-mock docker container', async () => {
    const res = await request('http://localhost:7007').get('/api/mails');
    expect(res.body.length).toBe(0);
  });
});
