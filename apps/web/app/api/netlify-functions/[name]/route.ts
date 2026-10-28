// Runs the Netlify Functions from /functions outside Netlify (Docker, `next start`).
// next.config.ts rewrites /.netlify/functions/:name to this route when not built on Netlify.
import { NextRequest } from "next/server";
import { handler as applicationAIMatch } from "@/functions/applicationAIMatch";
import { handler as applicationsForJob } from "@/functions/applicationsForJob";
import { handler as applyForJob } from "@/functions/applyForJob";
import { handler as candidateOnboardingStepThree } from "@/functions/candidateOnboardingStepThree";
import { handler as candidateOnboardingStepTwo } from "@/functions/candidateOnboardingStepTwo";
import { handler as createJob } from "@/functions/createJob";
import { handler as forgotPassword } from "@/functions/forgotPassword";
import { handler as getEmployer } from "@/functions/getEmployer";
import { handler as getJobs } from "@/functions/getJobs";
import { handler as getJobsPublic } from "@/functions/getJobsPublic";
import { handler as getUser } from "@/functions/getUser";
import { handler as login } from "@/functions/login";
import { handler as recruiterOnboardingStepThree } from "@/functions/recruiterOnboardingStepThree";
import { handler as recruiterOnboardingStepTwo } from "@/functions/recruiterOnboardingStepTwo";
import { handler as refreshToken } from "@/functions/refreshToken";
import { handler as register } from "@/functions/register";
import { handler as resendEmail } from "@/functions/resendEmail";
import { handler as resetPassword } from "@/functions/resetPassword";
import { handler as verifyEmail } from "@/functions/verifyEmail";

type NetlifyResult = {
  statusCode?: number;
  headers?: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  body?: string;
  isBase64Encoded?: boolean;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (event: any) => Promise<NetlifyResult>;

const handlers: Record<string, Handler> = {
  applicationAIMatch,
  applicationsForJob,
  applyForJob,
  candidateOnboardingStepThree,
  candidateOnboardingStepTwo,
  createJob,
  forgotPassword,
  getEmployer,
  getJobs,
  getJobsPublic,
  getUser,
  login,
  recruiterOnboardingStepThree,
  recruiterOnboardingStepTwo,
  refreshToken,
  register,
  resendEmail,
  resetPassword,
  verifyEmail,
};

async function run(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const handler = handlers[name];
  if (!handler) return Response.json({ error: "Function not found" }, { status: 404 });

  const url = new URL(req.url);
  const headers = Object.fromEntries(req.headers.entries());
  const contentType = headers["content-type"] || "";
  const isBinary = contentType.startsWith("multipart/form-data");
  let body: string | null = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const buf = Buffer.from(await req.arrayBuffer());
    body = isBinary ? buf.toString("base64") : buf.toString("utf8");
  }

  const result = await handler({
    httpMethod: req.method,
    path: url.pathname,
    headers,
    queryStringParameters: Object.fromEntries(url.searchParams.entries()),
    body,
    isBase64Encoded: isBinary,
  });

  const resHeaders = new Headers(result.headers);
  for (const [key, values] of Object.entries(result.multiValueHeaders ?? {})) {
    for (const value of values) resHeaders.append(key, value);
  }
  const resBody = result.body
    ? result.isBase64Encoded ? Buffer.from(result.body, "base64") : result.body
    : null;
  return new Response(resBody, { status: result.statusCode ?? 200, headers: resHeaders });
}

export { run as GET, run as POST, run as PUT, run as PATCH, run as DELETE };
