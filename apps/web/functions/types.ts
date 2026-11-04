// Minimal type for the Netlify Function event (only the fields our handlers read).
export type NetlifyEvent = {
  httpMethod: string;
  body: string;
  headers: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined> | null;
  isBase64Encoded?: boolean;
};
