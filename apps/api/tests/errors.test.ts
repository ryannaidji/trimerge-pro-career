import request from 'supertest';
import app from '../src/app';

describe('Error handling and CORS', () => {
  it('returns 404 JSON for unknown routes', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Not Found' });
  });

  it('rejects malformed JSON with 400 and no stack trace', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid JSON body' });
    expect(JSON.stringify(res.body)).not.toMatch(/stack|at .*\.ts/);
  });

  it('rejects requests from origins that are not allowed with 403', async () => {
    const res = await request(app).get('/does-not-exist').set('Origin', 'https://evil.example.com');
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: 'Origin not allowed' });
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('allows a configured origin', async () => {
    const res = await request(app).get('/does-not-exist').set('Origin', 'http://localhost:3000');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });
});
