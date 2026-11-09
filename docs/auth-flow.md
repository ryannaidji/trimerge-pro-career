# Auth Module Overview

## Stack
- Node.js
- Express
- MongoDB
- Mongoose
- Zod
- JWT
- bcryptjs
- Mailgun (integrated and working for OTP and password reset email delivery)

## Completed Backend Flows
- Registration for employer and talent users
- OTP verification
- Resend OTP
- Login
- Forgot password
- Reset password

## Main Models
### User
Stores:
- email
- passwordHash
- accountType
- isVerified
- status
- profile
- lastLoginAt

### OtpCode
Stores:
- userId
- type (`VERIFY_EMAIL` or `RESET_PASSWORD`)
- codeHash
- expiresAt
- usedAt
- attemptCount

### RefreshToken
Stores:
- userId
- tokenHash
- expiresAt
- revokedAt
- userAgent
- ipAddress

## Endpoints

### POST /api/v1/auth/register
Registers a new user and creates a verification OTP.

Request body:
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "accountType": "TALENT",
  "firstName": "John",
  "lastName": "Doe"
}
Success response:
{
  "message": "Registration successful. Please verify your email with the OTP sent."
}

## Page access in the website

**Author:** Ryan Naidji

`apps/web/app/components/ui/RouteGuards.tsx` decides where people land. It only controls navigation; the API enforces permissions with `requireAuth` and `requireRole`.

| Page | Allowed | Otherwise |
|---|---|---|
| `/applications`, `/recommended-jobs`, `/saved-jobs`, `/profile`, `/personal-information/*` | Candidates | Visitors to `/login`; other accounts to their home page |
| `/employer-dashboard`, `/recruiter-information/*` | Employers | Same |
| `/talent-search` | Employers, admins | Same |
| `/settings` | Any signed-in account | Visitors to `/login` |
| `/login`, `/join-now` | Visitors | Signed-in accounts to their home page |

Home pages: candidates `/browse-jobs`, employers `/employer-dashboard`, admins `/admin`. The `/session-expired` page is only for sessions that really expired.
