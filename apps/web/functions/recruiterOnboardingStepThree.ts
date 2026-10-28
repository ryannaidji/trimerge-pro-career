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

  const token = ev.headers?.authorization?.replace?.('Bearer ', '') || '';

  // parse body safely
  let parsed: unknown = {};
  try {
    parsed = JSON.parse(ev.body || '{}');
  } catch (e) {
    console.log('Failed to parse JSON body for recruiter step-3:', e);
  }

  // safely extract expected fields
  let companyOverview: unknown = '';
  let benefitsAndOpportunities: unknown = '';
  let primaryHiringNeeds: unknown = '';

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const p = parsed as Record<string, unknown>;
    companyOverview = p.companyOverview ?? '';
    benefitsAndOpportunities = p.benefitsAndOpportunities ?? '';
    primaryHiringNeeds = p.primaryHiringNeeds ?? '';
  }

  try {
    const payload = {
      companyOverview: typeof companyOverview === 'string' ? companyOverview : String(companyOverview || ''),
      benefitsAndOpportunities: typeof benefitsAndOpportunities === 'string' ? benefitsAndOpportunities : String(benefitsAndOpportunities || ''),
      primaryHiringNeeds: typeof primaryHiringNeeds === 'string' ? primaryHiringNeeds : String(primaryHiringNeeds || ''),
    };

    const response = await fetch(`${process.env.BASEURL}/api/v1/onboarding/recruiter/step-3`, {
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
