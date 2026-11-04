// Backend API base URL. Defaults to the local API so a missing variable can never
// send local traffic to the live backend. Deployments must set NEXT_PUBLIC_API_URL.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
