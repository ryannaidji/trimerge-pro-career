// import setCookieParser from 'set-cookie-parser';

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }
  const { email, password } = JSON.parse(event.body);


    try{
        const response = await fetch(`${process.env.BASEURL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email, password
            }),
        });
        const data = await response.json();
        console.log("Response from API:", data);
        if (!response.ok) {
            throw new Error(data.message || 'Could not login');
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error: unknown) {
        console.log(error)
        const message = error instanceof Error ? error.message : String(error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: message }),
        };
    }
};