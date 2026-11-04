// Offline help answers for the "Ask TriMerge" assistant (#35).
// Free and private: matching runs in the browser, nothing is sent to a server or an AI provider.
// To add an answer, add an entry with a few keywords; the best keyword match wins.

export type FaqEntry = {
  keywords: string[];
  answer: string;
  link?: { href: string; label: string };
};

export const FAQ: FaqEntry[] = [
  { keywords: ['apply', 'application', 'candidature', 'postuler'], answer: 'Open Browse Jobs, select a job and click "Apply Now". You need a free candidate account; you can follow every application from My Applications.', link: { href: '/browse-jobs', label: 'Browse jobs' } },
  { keywords: ['status', 'track', 'my applications', 'heard back', 'response'], answer: 'Your applications and their status (pending, reviewed, shortlisted, rejected) are listed in My Applications. You also get an email when an employer updates the status.', link: { href: '/applications', label: 'My applications' } },
  { keywords: ['resume', 'cv', 'upload', 'document'], answer: 'You can upload a resume (PDF, DOC or DOCX, up to 5 MB) during registration or when you apply.', link: { href: '/personal-information/step-one', label: 'Upload my resume' } },
  { keywords: ['account', 'sign up', 'signup', 'register', 'create', 'join'], answer: 'Create a free account as a candidate or an employer. We send a verification code to your email to activate it.', link: { href: '/join-now', label: 'Create an account' } },
  { keywords: ['password', 'forgot', 'reset', 'locked', 'login', 'log in', 'sign in'], answer: 'If you forgot your password, request a reset code by email and choose a new password.', link: { href: '/forgot-password', label: 'Reset my password' } },
  { keywords: ['code', 'verify', 'verification', 'email', 'otp'], answer: 'Verification codes expire after 10 minutes. If yours expired, sign in again and request a new code. Check your spam folder too.', link: { href: '/login', label: 'Sign in' } },
  { keywords: ['post', 'job', 'hire', 'hiring', 'recruit', 'employer', 'listing'], answer: 'Employers create an account, complete their company profile and post jobs from the employer dashboard. Applicants appear there with their resume.', link: { href: '/join-now?role=recruiter', label: 'Start hiring' } },
  { keywords: ['salary', 'pay', 'compensation', 'benefits'], answer: 'Salary ranges are shown on each job when the employer provides them. Use Browse Jobs to compare openings.', link: { href: '/browse-jobs', label: 'Browse jobs' } },
  { keywords: ['government', 'federal', 'state', 'contract', 'clearance', 'public sector'], answer: 'TriMergePRO Careers focuses on government and commercial contracting roles. Search by keyword (for example "clearance" or a city) on Browse Jobs.', link: { href: '/browse-jobs', label: 'Search jobs' } },
  { keywords: ['accessibility', 'disability', 'accommodation', 'screen reader'], answer: 'If you need a reasonable accommodation to apply, contact careers@trimergeconsulting.com or (305) 940-5344. See our accessibility statement for details.', link: { href: '/accessibility-statement', label: 'Accessibility statement' } },
  { keywords: ['eeo', 'discrimination', 'equal opportunity', 'diversity'], answer: 'TriMerge Consulting Group, P.A. is an Equal Opportunity Employer.', link: { href: '/eeo-statement', label: 'EEO statement' } },
  { keywords: ['privacy', 'data', 'delete', 'personal information', 'gdpr'], answer: 'Our privacy policy explains what we collect and how to ask for your data to be deleted.', link: { href: '/privacy-policy', label: 'Privacy policy' } },
  { keywords: ['contact', 'help', 'support', 'human', 'phone', 'talk'], answer: 'You can reach the TriMerge team at careers@trimergeconsulting.com or (305) 940-5344.', link: { href: 'mailto:careers@trimergeconsulting.com', label: 'Email the team' } },
  { keywords: ['about', 'trimerge', 'company', 'who'], answer: 'TriMergePRO Careers is the recruiting platform of TriMerge Consulting Group, P.A., a consulting, accounting, staffing and technology firm.', link: { href: '/about', label: 'About us' } },
];

export const FALLBACK: FaqEntry = {
  keywords: [],
  answer: 'I could not find an answer to that. Try words like "apply", "resume", "password" or "post a job", or contact our team.',
  link: { href: 'mailto:careers@trimergeconsulting.com', label: 'Email the team' },
};

const normalize = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ');

/** Return the FAQ entry whose keywords best match the question (longer keywords weigh more). */
export function findAnswer(question: string): FaqEntry {
  const q = ` ${normalize(question)} `;
  let best: FaqEntry = FALLBACK;
  let bestScore = 0;
  for (const entry of FAQ) {
    const score = entry.keywords.reduce((sum, k) => (q.includes(` ${normalize(k).trim()}`) ? sum + k.length : sum), 0);
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  return best;
}
