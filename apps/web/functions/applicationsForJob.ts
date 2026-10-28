export const handler = async (event: unknown) => {
  const ev = event as {
    httpMethod?: string;
    headers?: Record<string, string | undefined>;
    queryStringParameters?: Record<string, string | undefined> | null;
  };

  if (ev.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const token = ev.headers?.authorization?.replace?.('Bearer ', '') || '';

  const qs = ev.queryStringParameters ?? {};
  const jobId = qs.jobId ?? '';
  if (!jobId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing jobId query parameter' }) };
  }

  // Allowed query params
  const allowed = ['page', 'limit', 'sortBy', 'recommendation', 'confidenceLevel', 'aiMatchStatus', 'staleOnly'];
  const params = new URLSearchParams();
  for (const k of allowed) {
    const v = qs[k as keyof typeof qs];
    if (v !== undefined && v !== null && v !== '') params.set(k, v);
  }

  try {
    const url = `${process.env.BASEURL}/api/v1/applications/job/${encodeURIComponent(jobId)}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { statusCode: response.status || 502, body: JSON.stringify(data) };
    }

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log('applicationsForJob error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: message }) };
  }
};
