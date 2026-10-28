export type DialCode = { iso2: string; label: string; dialCode: string };

// Default first (United States), intentionally not exhaustive.
export const COUNTRY_DIAL_CODES: DialCode[] = [
  { iso2: 'US', label: 'United States', dialCode: '+1' },
  { iso2: 'CA', label: 'Canada', dialCode: '+1' },
  { iso2: 'GB', label: 'United Kingdom', dialCode: '+44' },
  { iso2: 'AU', label: 'Australia', dialCode: '+61' },
  { iso2: 'IN', label: 'India', dialCode: '+91' },
  { iso2: 'DE', label: 'Germany', dialCode: '+49' },
  { iso2: 'FR', label: 'France', dialCode: '+33' },
  { iso2: 'ES', label: 'Spain', dialCode: '+34' },
  { iso2: 'IT', label: 'Italy', dialCode: '+39' },
  { iso2: 'MX', label: 'Mexico', dialCode: '+52' },
  { iso2: 'BR', label: 'Brazil', dialCode: '+55' },
  { iso2: 'NG', label: 'Nigeria', dialCode: '+234' },
  { iso2: 'ZA', label: 'South Africa', dialCode: '+27' },
  { iso2: 'PH', label: 'Philippines', dialCode: '+63' },
  { iso2: 'PK', label: 'Pakistan', dialCode: '+92' },
  { iso2: 'NL', label: 'Netherlands', dialCode: '+31' },
  { iso2: 'SG', label: 'Singapore', dialCode: '+65' },
  { iso2: 'AE', label: 'United Arab Emirates', dialCode: '+971' },
];

export type { UsState } from '@/app/util/locationOptions';
export { US_STATES } from '@/app/util/locationOptions';

export const YEARS_OF_EXPERIENCE_OPTIONS = ['0-2', '3-5', '6-8', '9-15', '16 and up'] as const;
export type YearsOfExperienceOption = (typeof YEARS_OF_EXPERIENCE_OPTIONS)[number];
