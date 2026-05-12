const request = require('supertest');
const app = require('../server');

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.project).toBe('Byteforce Crowdfunding Platform');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('GET /nonexistent-route', () => {
  it('returns 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Route not found');
  });
});
// backend unit tests — health endpoint and payments API
