import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { env } from '../config/env';

type MailgunClient = ReturnType<InstanceType<typeof Mailgun>['client']>;
let mg: MailgunClient | null = null;

function getMailgunClient(): MailgunClient {
  if (!mg) {
    mg = new Mailgun(formData).client({ username: 'api', key: env.MAILGUN_API_KEY as string });
  }
  return mg;
}

/** Escape user-controlled values before inserting them into email HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Send an email with the configured driver (MAIL_DRIVER).
 * "console" (default) prints the email to the API logs, so local development
 * needs no email account; verification and reset codes appear in the logs.
 */
async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  if (env.MAIL_DRIVER === 'console') {
    if (env.NODE_ENV !== 'test') {
      console.log(
        `\n📧 [email:console] To: ${params.to}\n   Subject: ${params.subject}\n   ` +
          params.text.replace(/\n/g, '\n   ') +
          '\n'
      );
    }
    return;
  }

  try {
    await getMailgunClient().messages.create(env.MAILGUN_DOMAIN as string, {
      from: env.MAILGUN_SENDER as string,
      to: [params.to],
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
  } catch (err: any) {
    throw new Error(`Failed to send email: ${err?.message || err}`);
  }
}

export async function sendVerificationOtpEmail(to: string, otp: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Verify your email',
    text: `Your verification code is: ${otp}`,
    html: `<p>Your verification code is: <b>${otp}</b></p>`,
  });
}

export async function sendResetPasswordEmail(to: string, otp: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Reset your password',
    text: `Your password reset code is: ${otp}`,
    html: `<p>Your password reset code is: <b>${otp}</b></p>`,
  });
}

export async function sendNewApplicationNotificationEmail(params: {
  to: string;
  jobTitle: string;
}): Promise<void> {
  await sendEmail({
    to: params.to,
    subject: 'New application received for your job posting',
    text:
      `A new application has been submitted for your job posting.\n\n` +
      `Job Title: ${params.jobTitle}\n`,
    html:
      `<p>A new application has been submitted for your job posting.</p>` +
      `<p><b>Job Title:</b> ${escapeHtml(params.jobTitle)}</p>`,
  });
}


export async function sendApplicationStatusUpdatedEmail(params: {
  to: string;
  jobTitle: string;
  status: string;
}): Promise<void> {
  await sendEmail({
    to: params.to,
    subject: 'Your application status has been updated',
    text:
      `Your application status has been updated.\n\n` +
      `Job Title: ${params.jobTitle}\n` +
      `New Status: ${params.status}\n`,
    html:
      `<p>Your application status has been updated.</p>` +
      `<p><b>Job Title:</b> ${escapeHtml(params.jobTitle)}</p>` +
      `<p><b>New Status:</b> ${escapeHtml(params.status)}</p>`,
  });
}