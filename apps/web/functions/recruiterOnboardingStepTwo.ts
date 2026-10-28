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

    // Detect content-type. If multipart, proxy raw body to backend keeping headers.
    const contentType = ev.headers?.['content-type'] || ev.headers?.['Content-Type'] || '';
    const token = ev.headers?.authorization?.replace?.('Bearer ', '') || '';
    console.log(token)


    try {
        if (contentType.startsWith('multipart/form-data')) {
            // Netlify may encode the body as base64 when binary; preserve as Buffer when needed
            const body = ev.isBase64Encoded ? Buffer.from(ev.body || '', 'base64') : ev.body;
            const response = await fetch(`${process.env.BASEURL}/api/v1/onboarding/recruiter/step-2`, {
                headers:{
                Authorization: `Bearer ${token}`,
                'Content-Type': contentType,
                },
                method: 'POST',
                body,
            });

            const data = await response.json();
            console.log("Response from API:", response);
            console.log("Data from API: ", data)
            if (!response.ok) {
                throw new Error(data.message || data.error || 'Could not complete onboarding step 2');
            }

            return {
                statusCode: 200,
                body: JSON.stringify(data),
            };
        }

    // Fallback: expect JSON body with recruiter fields
    const parsed = JSON.parse(ev.body || '{}');
        const { companyName, companyWebsite, industry, companySize, location, yourRole, jobTitle } = parsed;
        console.log("Parsed body:", parsed);

        const response = await fetch(`${process.env.BASEURL}/api/v1/onboarding/recruiter/step-2`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                companyName,
                companyWebsite,
                industry,
                companySize,
                location,
                yourRole,
                jobTitle,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.log(data)
            console.log(response)
            throw new Error(data.message || data.error || 'Could not complete onboarding step 2');
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