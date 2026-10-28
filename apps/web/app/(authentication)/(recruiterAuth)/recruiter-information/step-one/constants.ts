export type { UsState } from '@/app/util/locationOptions';
export { US_STATES } from '@/app/util/locationOptions';

export const COMPANY_INDUSTRY_OPTIONS = [
  'Accounting & Financial Services',
  'Administrative & Business Services',
  'Consulting & Professional Services',
  'Construction & Engineering',
  'Education',
  'Energy & Utilities',
  'Government (Federal, State & Local)',
  'Healthcare',
  'Human Resources & Staffing',
  'Information Technology',
  'Manufacturing & Industrial',
  'Nonprofit Organization',
  'Professional Services',
  'Public Safety & Emergency Management',
  'Science & Environmental Services',
  'Transportation & Logistics',
  'Other',
] as const;

export type CompanyIndustryOption = (typeof COMPANY_INDUSTRY_OPTIONS)[number];

export const COMPANY_SIZE_OPTIONS = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1,000',
  '1,001-5,000',
  '5,001-10,000',
  '10,000+',
] as const;

export type CompanySizeOption = (typeof COMPANY_SIZE_OPTIONS)[number];
