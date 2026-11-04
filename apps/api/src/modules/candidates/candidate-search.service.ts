/**
 * Candidate search for recruiters (#41) — free, rule-based, no AI provider.
 * Ranks active candidates by skill matches (weight 3), job title / headline matches (2)
 * and summary or resume text matches (1). Returns only what a recruiter needs to decide
 * whether to look closer: no resume text, no email or phone (data minimization).
 * Author: Ryan Naidji
 */
import { z } from 'zod';
import { CandidateProfileModel } from './candidate.model';

export const candidateSearchQuerySchema = z.object({
  q: z.string().trim().max(200).optional().default(''),
  skills: z.string().trim().max(300).optional().default(''),
  location: z.string().trim().max(100).optional().default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CandidateSearchQuery = z.infer<typeof candidateSearchQuerySchema>;

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const tokens = (s: string) =>
  normalize(s)
    .split(/[^a-z0-9+#.]+/)
    .filter((t) => t.length > 1);

export async function searchCandidates(query: CandidateSearchQuery) {
  const wantedSkills = query.skills
    .split(',')
    .map((s) => normalize(s.trim()))
    .filter(Boolean);
  const words = tokens(query.q);
  const location = normalize(query.location);

  // Candidates who opted out of talent search are never returned (#60)
  const profiles = await CandidateProfileModel.find({ searchable: { $ne: false } })
    .select('userId skills headline jobTitleOrDesiredRole yearsOfExperience location professionalSummary bio resumeText resumeUrl updatedAt')
    .populate('userId', '_id profile accountType status')
    .lean();

  const results = profiles
    .map((p: any) => {
      const user = p.userId;
      if (!user || user.accountType !== 'TALENT' || user.status !== 'ACTIVE') return null;

      const skills: string[] = (p.skills || []).map((s: string) => normalize(s));
      const title = normalize([p.jobTitleOrDesiredRole, p.headline].filter(Boolean).join(' '));
      const text = normalize([p.professionalSummary, p.bio, p.resumeText].filter(Boolean).join(' '));

      if (location && !normalize(p.location || '').includes(location)) return null;

      const matchedSkills = wantedSkills.filter((w) => skills.includes(w) || text.includes(w));
      let score = matchedSkills.length * 3;
      for (const w of words) {
        if (skills.some((s) => s.includes(w))) score += 3;
        else if (title.includes(w)) score += 2;
        else if (text.includes(w)) score += 1;
      }

      const hasCriteria = wantedSkills.length > 0 || words.length > 0;
      if (hasCriteria && score === 0) return null;

      return {
        candidateId: user._id,
        profileId: p._id,
        name: [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' '),
        title: p.jobTitleOrDesiredRole || p.headline || '',
        location: p.location || '',
        yearsOfExperience: p.yearsOfExperience || '',
        skills: (p.skills || []).slice(0, 12),
        matchedSkills: matchedSkills,
        hasResume: Boolean(p.resumeUrl),
        score,
        updatedAt: p.updatedAt,
      };
    })
    .filter(Boolean) as { score: number; updatedAt: Date }[];

  results.sort((a, b) => b.score - a.score || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const start = (query.page - 1) * query.limit;
  return {
    candidates: results.slice(start, start + query.limit),
    pagination: {
      page: query.page,
      limit: query.limit,
      total: results.length,
      totalPages: Math.ceil(results.length / query.limit),
    },
  };
}
