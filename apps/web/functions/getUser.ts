// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
export const handler = async (event) => {
	// This function proxies a GET /api/v1/auth/me call to the backend
	if (event.httpMethod !== 'GET') {
		return {
			statusCode: 405,
			body: JSON.stringify({ error: 'Method not allowed' }),
		};
	}
	const ev = event as {
    httpMethod?: string;
    headers?: Record<string, string | undefined>;
  };

	const token = ev.headers?.authorization?.replace?.('Bearer ', '') || '';

	try {

		const response = await fetch(`${process.env.BASEURL}/api/v1/auth/me`, {
			method: 'GET',
			headers: {
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
		});

		const data = await response.json().catch(() => ({}));

		return {
			statusCode: response.status,
			body: JSON.stringify(data),
		};
	} catch (error: unknown) {
		console.error('checkAuth proxy error', error);
		const message = error instanceof Error ? error.message : 'Internal error'
		return {
			statusCode: 500,
			body: JSON.stringify({ error: message }),
		};
	}
};
