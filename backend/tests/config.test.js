const request = require('supertest');
const app = require('../index');
const configRouter = require('../routes/config');

describe('Config API', () => {
  test('POST /api/config creates config and returns 201', async () => {
    const payload = { topText: 'Hello', bottomText: 'World', fontSize: 24 };
    const res = await request(app).post('/api/config').send(payload).set('Accept', 'application/json');
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.topText).toBe('Hello');
  });

  test('PUT /api/config/:id updates existing config', async () => {
    // create first
    const payload = { topText: 'A', bottomText: 'B' };
    const create = await request(app).post('/api/config').send(payload).set('Accept', 'application/json');
    const id = create.body.id;
    const updated = { topText: 'Updated', bottomText: 'B' };
    const res = await request(app).put(`/api/config/${id}`).send(updated).set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body.topText).toBe('Updated');
  });
});
