// import setCookieParser from 'set-cookie-parser';

export const handler = async (event: any) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // Detect content-type. If multipart, proxy raw body to backend keeping headers.
    const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || '';
    const token = event.headers?.authorization?.replace('Bearer ', '') || '';
    console.log(token)


    try {
        if (contentType.startsWith('multipart/form-data')) {
            // Netlify may encode the body as base64 when binary; preserve as Buffer when needed
            const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
            const response = await fetch(`${process.env.BASEURL}/api/v1/onboarding/candidate/step-2`, {
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

        // Fallback: expect JSON body
        const parsed = JSON.parse(event.body || '{}');
        const { phoneNumber, location, jobTitleOrDesiredRole, yearsOfExperience, linkedinUrl, resumeUrl } = parsed;
        console.log("Parsed body:", parsed);

        const response = await fetch(`${process.env.BASEURL}/api/v1/onboarding/candidate/step-2`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phoneNumber,
                location,
                jobTitleOrDesiredRole,
                yearsOfExperience,
                linkedinUrl,
                resumeUrl,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
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