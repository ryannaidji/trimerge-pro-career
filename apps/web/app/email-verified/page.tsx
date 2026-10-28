import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { AuthShell } from '../components/ui/AuthShell'

// type Props = {
//   searchParams?: {
//     email?: string
//     role?: string
//   }
// }

type Props = {
  searchParams: Promise<{
    email?: string
    role?: string
  }>
}


// export default function Page({ searchParams }: Props) {
//   const email = searchParams?.email || 'your email address'
//   const role = (searchParams?.role || 'Candidate').toLowerCase()
//   console.log('Email verified page searchParams:', searchParams?.email, searchParams?.role)
//   const nextPath = role === 'recruiter' ? '/recruiter-information/step-one' : '/personal-information/step-one'
export default async function Page({ searchParams }: Props) {
  const params = await searchParams

  const email = params.email || 'your email address'
  const role = (params.role || 'Candidate').toLowerCase()

  console.log(params)
  const nextPath = role === 'recruiter' ? '/recruiter-information/step-one' : '/personal-information/step-one'

  return (
    <AuthShell
      eyebrow="Email verified"
      title="Your account is verified."
      subtitle={`We confirmed ${email}. You can continue into the ${role === 'recruiter' ? 'employer' : 'candidate'} onboarding flow now.`}
      bullets={[
        'Your verification code has been accepted.',
        'We are routing you to the right onboarding path next.',
        'If you need to switch accounts, go back to login first.',
      ]}
      footer={(
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--tp-muted)' }}>This is the confirmed next step after email verification.</span>
          <Link href="/login" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
            Back to login
          </Link>
        </div>
      )}
    >
      <div style={{ display: 'grid', gap: '1rem', textAlign: 'center' }}>
        <div style={{ display: 'grid', placeItems: 'center', width: '5rem', height: '5rem', borderRadius: '28px', marginInline: 'auto', background: 'linear-gradient(135deg, rgba(29,78,216,0.12), rgba(16,185,129,0.08))' }}>
          <CheckCircle2 size={30} color="var(--tp-primary)" />
        </div>

        <div>
          <div className="tp-kicker">Verification complete</div>
          <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>Continue onboarding now.</h2>
          <p className="tp-lead" style={{ marginTop: '0.6rem' }}>Use the button below to move into the next setup step for your role.</p>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div style={{ background: '#f8fafc', border: '1px solid rgba(148,163,184,0.18)', borderRadius: '18px', padding: '0.95rem 1rem', color: 'var(--tp-muted)', lineHeight: 1.6 }}>
            Email: <strong style={{ color: 'var(--tp-ink)' }}>{email}</strong>
            <br />
            Role: <strong style={{ color: 'var(--tp-ink)' }}>{role === 'recruiter' ? 'Recruiter' : 'Candidate'}</strong>
          </div>

          <Link href={nextPath} className="tp-btn-primary" style={{ width: '100%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '0.55rem' }}>
            Continue to onboarding
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}