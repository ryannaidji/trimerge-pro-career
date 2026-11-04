/**
 * Rule-based extraction of profile suggestions from resume text (#34).
 * No AI provider, no cost, deterministic. The candidate always reviews and confirms
 * the suggestions before anything is saved.
 * Author: Ryan Naidji
 */

export type ProfileSuggestions = {
  email?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  jobTitleOrDesiredRole?: string;
  yearsOfExperience?: string;
  skills: string[];
  professionalSummary?: string;
};

// Skills commonly requested in government and commercial contracting. Extend as needed.
const SKILLS = [
  // Technology
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'Oracle',
  'React', 'Angular', 'Node.js', '.NET', 'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform',
  'Linux', 'Windows Server', 'Active Directory', 'Networking', 'Cisco', 'ServiceNow', 'Salesforce', 'SAP',
  'Power BI', 'Tableau', 'Excel', 'Data Analysis', 'Machine Learning', 'DevOps', 'CI/CD', 'Git', 'Agile', 'Scrum',
  // Security and compliance
  'Cybersecurity', 'NIST', 'RMF', 'FedRAMP', 'CMMC', 'FISMA', 'HIPAA', 'SOC 2', 'ISO 27001', 'Security+', 'CISSP',
  'Incident Response', 'Vulnerability Management', 'SIEM',
  // Finance and accounting
  'Accounting', 'Auditing', 'GAAP', 'GASB', 'Budgeting', 'Financial Analysis', 'Accounts Payable',
  'Accounts Receivable', 'Payroll', 'QuickBooks', 'CPA', 'Grants Management', 'Procurement',
  // Management and consulting
  'Project Management', 'PMP', 'Program Management', 'Change Management', 'Business Analysis',
  'Stakeholder Management', 'Strategic Planning', 'Contract Management', 'Lean Six Sigma', 'ITIL',
  // Engineering and infrastructure
  'AutoCAD', 'Civil 3D', 'Revit', 'GIS', 'ArcGIS', 'Structural Engineering', 'Construction Management', 'OSHA',
  // Emergency management and public sector
  'Emergency Management', 'FEMA', 'ICS', 'NIMS', 'Disaster Recovery', 'Continuity of Operations', 'Public Policy',
  // Healthcare
  'EHR', 'Epic', 'Medical Billing', 'Clinical Research',
  // Human resources and administration
  'Recruiting', 'Talent Acquisition', 'HRIS', 'Onboarding', 'Customer Service', 'Microsoft Office',
  // Clearances and languages
  'Secret Clearance', 'Top Secret', 'Public Trust', 'Spanish', 'Bilingual',
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function findSkills(text: string): string[] {
  const found: string[] = [];
  for (const skill of SKILLS) {
    // Word boundaries that also work for skills like "C#", ".NET" or "Node.js"
    const re = new RegExp(`(^|[^A-Za-z0-9])${escape(skill)}(?=$|[^A-Za-z0-9])`, 'i');
    if (re.test(text)) found.push(skill);
  }
  return found.slice(0, 25);
}

function findEmail(text: string) {
  return text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)?.[0];
}

function findPhone(text: string) {
  // North American and international formats; needs at least 10 digits
  const match = text.match(/(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}/);
  return match?.[0].trim();
}

function findLinkedin(text: string) {
  const match = text.match(/(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?/i);
  if (!match) return undefined;
  return match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
}

function findYearsOfExperience(text: string): string | undefined {
  // "8 years of experience", "10+ years experience", "over 5 years in ..."
  const explicit = text.match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:professional\s+|relevant\s+|progressive\s+)?experience/i);
  if (explicit) return explicit[1];

  // Otherwise estimate from the earliest year in a date range (e.g. "2014 - Present")
  const currentYear = new Date().getFullYear();
  const years = [...text.matchAll(/\b(19[89]\d|20[0-4]\d)\s*(?:-|–|—|to)\s*(?:present|current|now|(?:19|20)\d{2})/gi)]
    .map((m) => Number(m[1]))
    .filter((y) => y <= currentYear);
  if (years.length === 0) return undefined;
  const total = currentYear - Math.min(...years);
  return total > 0 && total < 60 ? String(total) : undefined;
}

const TITLE_WORDS =
  /\b(engineer|developer|analyst|manager|specialist|consultant|accountant|auditor|architect|administrator|coordinator|director|officer|technician|designer|planner|scientist|assistant|lead|supervisor|recruiter|nurse)\b/i;

function findJobTitle(lines: string[]): string | undefined {
  // The headline is usually in the first lines, right after the name
  for (const line of lines.slice(0, 8)) {
    const clean = line.replace(/[|•·]/g, ' ').trim();
    if (clean.length >= 4 && clean.length <= 60 && TITLE_WORDS.test(clean) && !/@|http|\d{3}/.test(clean)) {
      return clean.replace(/\s+/g, ' ');
    }
  }
  return undefined;
}

function findSummary(text: string): string | undefined {
  const match = text.match(/(?:professional\s+summary|summary|profile|objective)\s*:?\s*\n?([\s\S]{40,900}?)(?:\n\s*\n|\n[A-Z][A-Z &]{3,}\n)/i);
  const summary = match?.[1].replace(/\s+/g, ' ').trim();
  return summary ? summary.slice(0, 800) : undefined;
}

export function extractProfileSuggestions(text: string): ProfileSuggestions {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return {
    email: findEmail(text),
    phoneNumber: findPhone(text),
    linkedinUrl: findLinkedin(text),
    jobTitleOrDesiredRole: findJobTitle(lines),
    yearsOfExperience: findYearsOfExperience(text),
    skills: findSkills(text),
    professionalSummary: findSummary(text),
  };
}
