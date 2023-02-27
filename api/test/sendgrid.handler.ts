import * as request from 'supertest';

// GET /api/mails
// GET /api/mails?to=email@address.com
// DELETE /api/mails

const sendgridHandler = {
  get: (address?: string) => {
    return request(`http://localhost:7007`)
      .get(`/api/mails`)
      .query(address ? { to: address } : null);
  },
  delete: (address?: string) => {
    return request(`http://localhost:7007`)
      .delete('/api/mails')
      .query(address ? { to: address } : null);
  },
};

export default sendgridHandler;
