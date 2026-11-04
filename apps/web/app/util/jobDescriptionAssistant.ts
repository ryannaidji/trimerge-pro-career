// Job description assistant (#40) — free and offline, no AI provider.
// 1. draftJobDescription(): a structured first draft from the job title and department,
//    using role families common in government and commercial contracting.
// 2. checkInclusiveLanguage(): flags wording that can discourage qualified applicants or
//    signal bias (age, gender, disability, "culture fit" jargon), with a suggested alternative.
// The employer always reviews and edits the text; nothing is published automatically.
// Author: Ryan Naidji

export type JobDraft = {
  positionSummary: string;
  keyResponsibilities: string;
  minQualifications: string;
  preferredQualifications: string;
};

type RoleFamily = {
  match: RegExp;
  focus: string;
  duties: string[];
  required: string[];
  preferred: string[];
};

const FAMILIES: RoleFamily[] = [
  {
    match: /cyber|security|soc\b|infosec/i,
    focus: 'protect systems and data against cyber threats',
    duties: ['Monitor, detect and respond to security events and incidents', 'Assess systems against NIST and agency security controls', 'Maintain security documentation, plans of action and milestones (POA&M)', 'Recommend and implement security improvements'],
    required: ['Experience in information security or a related field', 'Knowledge of the NIST Risk Management Framework', 'Ability to obtain and maintain a security clearance, if required'],
    preferred: ['Security+, CISSP or equivalent certification', 'Experience supporting federal or state agencies'],
  },
  {
    match: /cloud|devops|platform|infrastructure|systems? (admin|engineer)|network/i,
    focus: 'design, operate and improve reliable IT infrastructure',
    duties: ['Build and maintain cloud or on-premises infrastructure', 'Automate deployments and routine operations', 'Monitor performance, availability and cost', 'Document configurations and support compliance requirements'],
    required: ['Experience administering cloud or enterprise infrastructure', 'Scripting or infrastructure-as-code experience', 'Strong troubleshooting skills'],
    preferred: ['AWS, Azure or Google Cloud certification', 'Experience with FedRAMP or regulated environments'],
  },
  {
    match: /developer|software|engineer|programmer|web/i,
    focus: 'build and maintain software that serves our clients and their users',
    duties: ['Design, develop, test and maintain applications', 'Collaborate with analysts and stakeholders to refine requirements', 'Review code and follow secure development practices', 'Support releases and resolve production issues'],
    required: ['Experience developing software in a modern language', 'Familiarity with version control and testing practices', 'Clear written and verbal communication'],
    preferred: ['Experience with accessibility (Section 508 / WCAG)', 'Experience on government or public-sector projects'],
  },
  {
    match: /account|audit|financ|budget|payroll|grant|controller|bookkeep/i,
    focus: 'deliver accurate financial management and reporting',
    duties: ['Prepare and review financial statements, reconciliations and reports', 'Support budgeting, forecasting and grant management', 'Ensure compliance with GAAP or GASB and internal controls', 'Assist with audits and respond to auditor requests'],
    required: ["Bachelor's degree in accounting, finance or a related field, or equivalent experience", 'Experience with accounting systems and Excel', 'Attention to detail and sound judgment'],
    preferred: ['CPA or progress toward certification', 'Public-sector or nonprofit accounting experience'],
  },
  {
    match: /project|program|pmo|scrum|delivery/i,
    focus: 'plan and deliver projects on time, on budget and to the expected quality',
    duties: ['Define scope, schedules, budgets and resources', 'Coordinate stakeholders and report status and risks', 'Track deliverables, issues and contract requirements', 'Lead meetings and maintain project documentation'],
    required: ['Experience managing projects or programs', 'Strong organization and communication skills', 'Experience with project management tools'],
    preferred: ['PMP, PMI-ACP or Scrum certification', 'Experience with government contracts and reporting'],
  },
  {
    match: /analyst|data|business intelligence|research|report/i,
    focus: 'turn data and requirements into clear insights and decisions',
    duties: ['Collect, clean and analyze data from multiple sources', 'Build reports and dashboards for stakeholders', 'Document requirements and business processes', 'Present findings and recommendations'],
    required: ['Experience with data analysis and reporting tools', 'Strong analytical and problem-solving skills', 'Ability to explain findings to non-technical audiences'],
    preferred: ['SQL, Power BI or Tableau experience', 'Experience in a public-sector environment'],
  },
  {
    match: /emergency|resilien|disaster|continuity|preparedness/i,
    focus: 'help agencies and communities prepare for, respond to and recover from emergencies',
    duties: ['Develop and update emergency, continuity and recovery plans', 'Coordinate exercises, training and after-action reviews', 'Support response and recovery operations', 'Track grants and compliance with FEMA requirements'],
    required: ['Experience in emergency management or a related field', 'Knowledge of ICS and NIMS', 'Ability to work under pressure during activations'],
    preferred: ['FEMA Professional Development Series or CEM', 'Experience with public assistance or hazard mitigation programs'],
  },
];

const GENERIC: RoleFamily = {
  match: /.*/,
  focus: 'support our team and clients with high-quality work',
  duties: ['Carry out the core duties of the role with accuracy and professionalism', 'Collaborate with team members and stakeholders', 'Maintain clear records and documentation', 'Identify and suggest process improvements'],
  required: ['Relevant experience or equivalent education', 'Strong communication and organizational skills', 'Ability to work independently and as part of a team'],
  preferred: ['Experience supporting government or commercial clients'],
};

const list = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Build an editable first draft (HTML for the rich-text fields). */
export function draftJobDescription(input: { title: string; department?: string; employmentType?: string; workArrangement?: string }): JobDraft {
  const title = escapeHtml(input.title.trim() || 'this role');
  const family = FAMILIES.find((f) => f.match.test(input.title)) ?? GENERIC;
  const type = input.employmentType ? input.employmentType.replace('_', '-').toLowerCase() : '';
  const where = input.workArrangement ? ` (${input.workArrangement.toLowerCase()})` : '';
  return {
    positionSummary: `<p>We are looking for a ${type ? `${type} ` : ''}<strong>${title}</strong>${where} to ${family.focus}. You will work with TriMerge teams and clients across government and commercial sectors.</p>`,
    keyResponsibilities: list(family.duties),
    minQualifications: list(family.required),
    preferredQualifications: list(family.preferred),
  };
}

export type LanguageIssue = { term: string; reason: string; suggestion: string };

const FLAGS: { re: RegExp; reason: string; suggestion: string }[] = [
  { re: /\b(rock ?star|ninja|guru|wizard|superstar)\b/i, reason: 'Jargon that can discourage qualified applicants', suggestion: 'expert, skilled professional' },
  { re: /\b(young|youthful|energetic|digital native|recent graduates? only)\b/i, reason: 'Can signal age bias', suggestion: 'motivated, comfortable with modern tools' },
  { re: /\b(he|him|his|manpower|chairman|salesman|guys)\b/i, reason: 'Gendered wording', suggestion: 'they, the candidate, workforce, chair, salesperson, team' },
  { re: /\bnative (english )?speaker\b/i, reason: 'Can signal national-origin bias', suggestion: 'fluent in English' },
  { re: /\b(able-bodied|must be able to stand|physically fit)\b/i, reason: 'Can exclude people with disabilities; describe the essential task instead', suggestion: 'able to perform [essential task] with or without reasonable accommodation' },
  { re: /\bculture fit\b/i, reason: 'Vague; can hide bias', suggestion: 'shares our values of [value]' },
  { re: /\b(aggressive|dominant|competitive)\b/i, reason: 'Gender-coded wording that can reduce applications', suggestion: 'proactive, driven' },
  { re: /\bwork hard,? play hard\b/i, reason: 'Can signal long hours and exclude caregivers', suggestion: 'describe actual schedule expectations' },
];

/** Return inclusive-language warnings for the given text (HTML tags are ignored). */
export function checkInclusiveLanguage(html: string): LanguageIssue[] {
  const text = html.replace(/<[^>]+>/g, ' ');
  const issues: LanguageIssue[] = [];
  for (const f of FLAGS) {
    const m = text.match(f.re);
    if (m) issues.push({ term: m[0], reason: f.reason, suggestion: f.suggestion });
  }
  return issues;
}
