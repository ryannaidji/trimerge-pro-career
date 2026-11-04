import { extractProfileSuggestions } from '../src/modules/resumes/resume-profile-extractor';

const sampleResume = `Jane Doe
Senior Cloud Engineer
Miami, FL | (305) 555-0142 | jane.doe@example.com | linkedin.com/in/janedoe

PROFESSIONAL SUMMARY
Cloud engineer with 8 years of experience designing secure AWS and Azure platforms for state agencies and FedRAMP workloads.

EXPERIENCE
Cloud Engineer, Acme Gov Solutions — 2019 - Present
Systems Administrator, City of Miami — 2016 - 2019

SKILLS
AWS, Azure, Terraform, Kubernetes, Python, NIST, Agile, Secret Clearance
`;

describe('Resume profile extractor', () => {
  const s = extractProfileSuggestions(sampleResume);

  it('extracts contact details', () => {
    expect(s.email).toBe('jane.doe@example.com');
    expect(s.phoneNumber).toBe('(305) 555-0142');
    expect(s.linkedinUrl).toBe('https://linkedin.com/in/janedoe');
  });

  it('extracts the headline as job title', () => {
    expect(s.jobTitleOrDesiredRole).toBe('Senior Cloud Engineer');
  });

  it('prefers explicit years of experience', () => {
    expect(s.yearsOfExperience).toBe('8');
  });

  it('finds known skills, including multi-word ones', () => {
    expect(s.skills).toEqual(expect.arrayContaining(['AWS', 'Azure', 'Terraform', 'Kubernetes', 'Python', 'NIST', 'FedRAMP', 'Secret Clearance']));
    expect(s.skills).not.toContain('Java'); // must not match inside "JavaScript" or other words
  });

  it('extracts the summary paragraph', () => {
    expect(s.professionalSummary).toMatch(/^Cloud engineer with 8 years/);
  });

  it('estimates experience from date ranges when not stated', () => {
    const year = new Date().getFullYear();
    const r = extractProfileSuggestions(`John Smith\nAccountant\nStaff Accountant 2015 - Present\nGAAP, QuickBooks`);
    expect(r.yearsOfExperience).toBe(String(year - 2015));
    expect(r.skills).toEqual(['GAAP', 'QuickBooks']);
  });
});
