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
  const id = typeof p.id === 'string' ? p.id : '';

  try {
    const response = await fetch(`${process.env.BASEURL}/api/v1/applications/${id}/ai-match/retry`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      console.log(data)
      throw new Error(data?.message || data?.error || 'Failed to create job');
    }

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err: unknown) {
    console.log('createJob error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return { statusCode: 500, body: JSON.stringify({ error: message }) };
  }
};
