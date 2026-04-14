const request = require('supertest');
const app = require('../server');

// Mock Stripe and Supabase so tests run without real credentials
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
        metadata: { backer_id: 'user-uuid-123' },
      }),
      cancel: jest.fn().mockResolvedValue({}),
    },
    webhooks: {
      constructEvent: jest.fn().mockImplementation(() => {
        throw new Error('No signatures found matching the expected signature for payload');
      }),
    },
  }));
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-uuid-123' } },
        error: null,
      }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'campaign-uuid', title: 'Test Campaign', status: 'active' },
        error: null,
      }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    }),
  }),
}));

describe('POST /api/payments/checkout', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app)
      .post('/api/payments/checkout')
      .send({ campaign_id: 'abc', amount: 50 });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/unauthorized/i);
  });

  it('returns 400 when amount is missing', async () => {
    const res = await request(app)
      .post('/api/payments/checkout')
      .set('Authorization', 'Bearer fake-token')
      .send({ campaign_id: 'abc' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/amount/i);
  });

  it('returns 400 when amount is negative', async () => {
    const res = await request(app)
      .post('/api/payments/checkout')
      .set('Authorization', 'Bearer fake-token')
      .send({ campaign_id: 'abc', amount: -5 });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when campaign_id is missing', async () => {
    const res = await request(app)
      .post('/api/payments/checkout')
      .set('Authorization', 'Bearer fake-token')
      .send({ amount: 50 });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/payments/confirm', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app)
      .post('/api/payments/confirm')
      .send({ payment_intent_id: 'pi_test_123' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when payment_intent_id is missing', async () => {
    const res = await request(app)
      .post('/api/payments/confirm')
      .set('Authorization', 'Bearer fake-token')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/payment_intent_id/i);
  });
});

describe('POST /api/payments/webhook', () => {
  it('returns 400 with invalid stripe signature', async () => {
    const res = await request(app)
      .post('/api/payments/webhook')
      .set('stripe-signature', 'invalid_sig')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ type: 'payment_intent.succeeded' }));
    expect(res.statusCode).toBe(400);
  });
});
