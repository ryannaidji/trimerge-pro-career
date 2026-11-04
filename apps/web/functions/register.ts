// import setCookieParser from 'set-cookie-parser';

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }
  const { name, email, password, confirmPassword, terms, updates, role } = JSON.parse(event.body);


    try{
        const response = await fetch(`${process.env.BASEURL}/api/v1/onboarding/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName: name,
                email,
                password,
                confirmPassword,
                role,
                "agreeToTerms": terms,
                "receiveUpdates": updates,
            }),
        });
  
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error: unknown) {
        console.error(error)
        const message = error instanceof Error ? error.message : String(error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: message }),
        };
    }
};