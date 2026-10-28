import { useState } from 'react';

type ApplyParams = {
  jobId: string;
  resumeFile?: File | null;
  file?: File | null;          // cover letter PDF
  coverLetter?: string;        // cover letter text
  answers?: Record<string, string>;
};

export default function useApplyForJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function apply(params: ApplyParams) {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('tm_token') : null;
      const url = 'https://trimerge-pro-career.onrender.com/api/v1/applications';

      let res: Response;
      const fd = new FormData();
      fd.append('jobId', params.jobId);
      if (params.resumeFile) fd.append('resumeFile', params.resumeFile, params.resumeFile.name);
      if (params.file) fd.append('coverLetterFile', params.file, params.file.name);
      if (params.coverLetter) fd.append('coverLetter', params.coverLetter);
      if (params.answers) fd.append('answers', JSON.stringify(params.answers));

      res = await fetch(url, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || data?.message || 'Failed to submit application';
        throw new Error(msg);
      }

      setResult(data);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { apply, loading, error, result } as const;
}
