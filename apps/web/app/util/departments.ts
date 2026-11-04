// Job departments aligned with TriMerge's sectors (#62). Keep in sync with
// apps/api/src/modules/jobs/departments.ts. Legacy values still get a readable label.
// Author: Ryan Naidji
export const JOB_DEPARTMENTS: { value: string; label: string }[] = [
  { value: 'PROFESSIONAL_SERVICES', label: 'Professional Services' },
  { value: 'GOVERNMENT', label: 'Government & Public Sector' },
  { value: 'TECHNOLOGY', label: 'Technology & Digital Solutions' },
  { value: 'FINANCE', label: 'Accounting & Finance' },
  { value: 'ENGINEERING', label: 'Engineering & Infrastructure' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'EMERGENCY_MANAGEMENT', label: 'Emergency Management & Resiliency' },
  { value: 'ADMINISTRATION', label: 'Administrative & Operations' },
  { value: 'DATA_ANALYTICS', label: 'Data & Analytics' },
  { value: 'CONSULTING', label: 'Leadership & Consulting' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'NONPROFIT', label: 'Nonprofit & Community Services' },
];

const LEGACY_LABELS: Record<string, string> = { MARKETING: 'Marketing', SALES: 'Sales', DESIGN: 'Design', OPERATIONS: 'Operations' };

/** Human-readable label for a department value (falls back to a title-cased value). */
export function departmentLabel(value?: string | null): string {
  if (!value) return '';
  const known = JOB_DEPARTMENTS.find((d) => d.value === value)?.label ?? LEGACY_LABELS[value];
  return known ?? value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
