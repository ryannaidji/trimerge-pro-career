export const handler = async (event: unknown) => {
  const ev = event as {
    httpMethod?: string;
    headers?: Record<string, string | undefined>;
    body?: string;
    isBase64Encoded?: boolean;
  };

  if (ev.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const token = ev.headers?.authorization?.replace?.('Bearer ', '') || '';

  // parse body
  let parsed: unknown = {};
  try {
    parsed = JSON.parse(ev.body || '{}');
  } catch (e) {
    console.log('Failed to parse createJob body:', e);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  // extract and coerce
  const p = (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? (parsed as Record<string, unknown>) : {};

  const title = typeof p.title === 'string' ? p.title : '';
  const description = typeof p.description === 'string' ? p.description : '';
  const requirements = typeof p.requirements === 'string' ? p.requirements : '';
  const location = typeof p.location === 'string' ? p.location : '';
  const department = typeof p.department === 'string' ? p.department : '';

  const employmentTypeRaw = typeof p.employmentType === 'string' ? p.employmentType.toUpperCase() : '';
  const allowedEmployment = new Set(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']);
  const employmentType = allowedEmployment.has(employmentTypeRaw) ? employmentTypeRaw : undefined;

  const salaryMin = typeof p.salaryMin === 'number' ? p.salaryMin : Number(p.salaryMin) || 0;
  const salaryMax = typeof p.salaryMax === 'number' ? p.salaryMax : Number(p.salaryMax) || 0;
  const currency = typeof p.currency === 'string' ? p.currency : '';

  const skills = Array.isArray(p.skills) ? p.skills.filter((s) => typeof s === 'string') : [];

  const statusRaw = typeof p.status === 'string' ? p.status.toUpperCase() : '';
  const allowedStatus = new Set(['OPEN', 'CLOSED', 'DRAFT']);
  const status = allowedStatus.has(statusRaw) ? statusRaw : undefined;

  const payload: Record<string, unknown> = {
    title,
    description,
    requirements,
    location,
    salaryMin,
    salaryMax,
    currency,
    skills,
    department
  };
  if (employmentType) payload.employmentType = employmentType;
  if (status) payload.status = status;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${process.env.BASEURL}/api/v1/jobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

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
    console.log('createJob error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return { statusCode: 500, body: JSON.stringify({ error: message }) };
  }
};
