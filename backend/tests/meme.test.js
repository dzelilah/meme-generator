const request = require('supertest');
const app = require('../index');
const sharp = require('sharp');

describe('Meme preview API', () => {
  test('POST /api/meme/preview returns small image', async () => {
    // create a small red PNG buffer via sharp
    const png = await sharp({ create: { width: 200, height: 100, channels: 3, background: { r: 255, g: 0, b: 0 } } }).png().toBuffer();

    const res = await request(app)
      .post('/api/meme/preview')
      .attach('image', png, 'test.png')
      .field('config', JSON.stringify({ topText: 'Hi' }));

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/image\//);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
