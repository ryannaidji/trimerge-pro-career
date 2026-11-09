// Refresh tokens must be unique per login, even within the same second.
// Author: Ryan Naidji
import { generateTokens } from '../src/utils/generate-tokens';

describe('generateTokens', () => {
  it('issues a different refresh token each time for the same user', () => {
    const payload = { userId: 'user-1', email: 'user@example.test', accountType: 'TALENT' };
    jest.useFakeTimers({ now: new Date('2026-11-09T00:00:00Z') });
    try {
      expect(generateTokens(payload).refreshToken).not.toBe(generateTokens(payload).refreshToken);
    } finally {
      jest.useRealTimers();
    }
  });
});
