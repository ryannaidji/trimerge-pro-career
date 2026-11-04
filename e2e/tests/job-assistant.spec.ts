// Unit tests for the offline job description assistant (#40); no browser needed.
import { expect, test } from '@playwright/test';
import { checkInclusiveLanguage, draftJobDescription } from '../../apps/web/app/util/jobDescriptionAssistant';

test('drafts a cybersecurity description from the title', () => {
  const d = draftJobDescription({ title: 'Cybersecurity Analyst', employmentType: 'FULL_TIME', workArrangement: 'HYBRID' });
  expect(d.positionSummary).toContain('<strong>Cybersecurity Analyst</strong>');
  expect(d.positionSummary).toContain('full-time');
  expect(d.minQualifications).toContain('NIST');
});

test('falls back to a generic template and escapes HTML in the title', () => {
  const d = draftJobDescription({ title: '<img src=x onerror=alert(1)> Coordinator' });
  expect(d.positionSummary).not.toContain('<img');
  expect(d.keyResponsibilities).toContain('<li>');
});

test('flags biased wording with a suggestion', () => {
  const issues = checkInclusiveLanguage('<p>We need a young rockstar developer, native English speaker.</p>');
  expect(issues.map((i) => i.term.toLowerCase())).toEqual(expect.arrayContaining(['rockstar', 'young', 'native english speaker']));
  expect(checkInclusiveLanguage('<p>Experienced analyst, fluent in English.</p>')).toEqual([]);
});
