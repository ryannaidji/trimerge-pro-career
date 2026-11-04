/**
 * Job departments aligned with TriMerge's sectors (#62), as shown on the homepage.
 * LEGACY values from the first version stay valid so existing jobs keep working,
 * but they are no longer offered in the forms.
 * Author: Ryan Naidji
 */
export const JOB_DEPARTMENTS = [
  'PROFESSIONAL_SERVICES',
  'GOVERNMENT',
  'TECHNOLOGY',
  'FINANCE',
  'ENGINEERING',
  'HEALTHCARE',
  'EMERGENCY_MANAGEMENT',
  'ADMINISTRATION',
  'DATA_ANALYTICS',
  'CONSULTING',
  'HR',
  'NONPROFIT',
] as const;

export const LEGACY_DEPARTMENTS = ['MARKETING', 'SALES', 'DESIGN', 'OPERATIONS'] as const;

export const ALL_DEPARTMENTS = [...JOB_DEPARTMENTS, ...LEGACY_DEPARTMENTS] as const;
export type JobDepartment = (typeof ALL_DEPARTMENTS)[number];
