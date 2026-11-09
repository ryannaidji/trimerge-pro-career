// LinkedIn stays optional when the onboarding form sends an empty value (#88).
// Author: Ryan Naidji
import { candidateStep2Schema } from '../src/modules/onboarding/onboarding.schemas';

const base = { location: 'Miami, FL', jobTitleOrDesiredRole: 'Analyst', yearsOfExperience: '0-2' };

describe('candidateStep2Schema linkedinUrl', () => {
  it('treats an empty value as not provided', () => {
    expect(candidateStep2Schema.parse({ ...base, linkedinUrl: '' }).linkedinUrl).toBeUndefined();
  });

  it('accepts a URL and rejects other text', () => {
    expect(candidateStep2Schema.parse({ ...base, linkedinUrl: 'https://www.linkedin.com/in/a' }).linkedinUrl).toBe('https://www.linkedin.com/in/a');
    expect(candidateStep2Schema.safeParse({ ...base, linkedinUrl: 'not a url' }).success).toBe(false);
  });
});
