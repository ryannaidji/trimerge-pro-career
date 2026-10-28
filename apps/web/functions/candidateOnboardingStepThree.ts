// import setCookieParser from 'set-cookie-parser';

export const handler = async (event: unknown) => {
    const ev = event as {
        httpMethod?: string;
        headers?: Record<string, string | undefined>;
        body?: string;
        isBase64Encoded?: boolean;
    };

    if (ev.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // grab token from incoming headers (forward from client)
    const token = ev.headers?.authorization?.replace?.('Bearer ', '') || '';

        // parse body safely without using `any`
        let parsed: unknown = {};
        try {
        parsed = JSON.parse(ev.body || '{}');
        } catch (e) {
            // if parsing fails, proceed with empty object - the backend will validate
            console.log('Failed to parse JSON body for step-3:', e);
        }

        // safely extract expected fields
        let skills: unknown = [];
        let professionalSummary: unknown = '';

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const p = parsed as Record<string, unknown>;
            skills = p.skills ?? [];
            professionalSummary = p.professionalSummary ?? '';
        }

    try {
            const payload = {
                skills: Array.isArray(skills) ? skills : [],
                professionalSummary: typeof professionalSummary === 'string' ? professionalSummary : String(professionalSummary || ''),
            };

            const response = await fetch(`${process.env.BASEURL}/api/v1/onboarding/candidate/step-3`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

        const data = await response.json();
        console.log('Response from API:', response);

        if (!response.ok) {
            throw new Error(data?.message || data?.error || 'Could not complete onboarding step 3');
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (err: unknown) {
        console.log(err);
        const message = err instanceof Error ? err.message : String(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: message }),
        };
    }
};