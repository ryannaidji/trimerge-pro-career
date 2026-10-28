// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
export const handler = async (event) => {
  // This function proxies a POST /api/v1/auth/refresh-token call to the backend
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const refreshToken = body.refreshToken;

    const response = await fetch(`${process.env.BASEURL}/api/v1/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json().catch(() => ({}));

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('refreshToken proxy error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err?.message || 'Internal error' }),
    };
  }
};
