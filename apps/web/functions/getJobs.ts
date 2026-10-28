export const handler = async (event: unknown) => {
  const ev = event as {
    httpMethod?: string;
    headers?: Record<string, string | undefined>;
    queryStringParameters?: Record<string, string | undefined>;
    rawQuery?: string;
  };

  if (ev.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const qs = ev.queryStringParameters ?? {};

  const allowedStatus = new Set(['OPEN', 'CLOSED', 'DRAFT']);
  const allowedEmployment = new Set(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']);

  const params = new URLSearchParams();

  if (qs.page) params.append('page', qs.page);
  if (qs.limit) params.append('limit', qs.limit);

  if (qs.status) {
    const s = qs.status.toUpperCase();
    if (allowedStatus.has(s)) params.append('status', s);
  }

  if (qs.employmentType) {
    const e = qs.employmentType.toUpperCase();
    if (allowedEmployment.has(e)) params.append('employmentType', e);
  }

  if (qs.location) params.append('location', qs.location);
  if (qs.search) params.append('search', qs.search);

  const url = `${process.env.BASEURL}/api/v1/jobs${params.toString() ? `?${params.toString()}` : ''}`;

  try {
    const token = ev.headers?.authorization?.replace?.('Bearer ', '') || '';

    const fetchOpts: RequestInit = { method: 'GET', headers: {} };
    if (token) (fetchOpts.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, fetchOpts);

    const rawBody = await response.text();
    let data: unknown = rawBody;

    try {
      data = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      // Keep raw text when the upstream response isn't JSON.
    }

    return {
      statusCode: response.status,
      body: typeof data === 'string' ? JSON.stringify({ error: data }) : JSON.stringify(data),
    };
  } catch (err: unknown) {
    console.log('getJobs error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return { statusCode: 500, body: JSON.stringify({ error: message }) };
  }
};
