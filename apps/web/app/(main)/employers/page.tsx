import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BarChart3, ClipboardList, ShieldCheck, Sparkles, Users } from 'lucide-react'

const features = [
  { title: 'Guided onboarding', description: 'A short, structured setup gets your company profile and hiring team ready to post.', icon: ClipboardList },
  { title: 'Verified email confirmation', description: 'Every employer account is verified before it can post or review candidates.', icon: ShieldCheck },
  { title: 'Candidate and employer paths', description: 'Separate, purpose-built experiences so your postings reach the right talent pool.', icon: Users },
  { title: 'Job application tracking', description: 'See every applicant against a posting in one place, from submission to decision.', icon: ClipboardList },
  { title: 'AI-powered candidate matching', description: 'Scoring that highlights the strongest applicants against your job requirements.', icon: Sparkles },
  { title: 'Centralized applicant dashboard', description: 'Review, filter, and manage candidates across every open position you post.', icon: BarChart3 },
]

const steps = [
  { title: 'Create your employer account', text: 'Sign up, verify your email, and complete a short company profile.' },
  { title: 'Post your opening', text: 'Add the role details, requirements, and compensation candidates need to apply.' },
  { title: 'Review and hire', text: 'Track applicants, compare candidates, and move your top picks forward.' },
]

export default function EmployersPage() {
  return (
    <div className="tp-shell" style={{ overflow: 'hidden' }}>
      <section style={{ padding: '3rem 0 5rem' }}>
        <div className="tp-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          <div className="auth-span-7">
            <div className="tp-card-soft tp-fade-up" style={{ position: 'relative', overflow: 'hidden', padding: '2rem' }}>
              <div style={{ position: 'absolute', inset: 'auto -4rem -4rem auto', width: '16rem', height: '16rem', borderRadius: '999px', background: 'radial-gradient(circle, rgba(245,166,35,0.18), rgba(245,166,35,0) 70%)', filter: 'blur(10px)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="tp-kicker">For Employers</div>
                <h1 className="tp-title" style={{ fontSize: 'clamp(2.6rem, 6vw, 4.25rem)', margin: '0.5rem 0 0' }}>
                  Hire faster. Hire smarter.
                </h1>
                <p className="tp-lead" style={{ fontSize: '1.08rem', marginTop: '1.2rem', maxWidth: '38rem' }}>
                  Post opportunities, manage applicants, review candidates, and streamline your recruiting process through one workforce platform built for teams of every size.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginTop: '1.5rem' }}>
                  <Link href="/join-now?role=recruiter" className="tp-btn-primary">
                    Post a Position
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/login" className="tp-btn-secondary">
                    Employer Login
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-span-5">
            <Image src="/recruiter.svg" alt="Illustration of an employer reviewing candidates" width={551} height={536} style={{ width: '100%', height: 'auto' }} />
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 5rem' }}>
        <div className="tp-container">
          <div style={{ marginBottom: '1.3rem' }}>
            <div className="tp-kicker">Built for hiring teams</div>
            <h2 className="tp-title" style={{ fontSize: 'clamp(2rem, 4vw, 3.1rem)', margin: '0.35rem 0 0' }}>Everything you need to hire, in one place.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(17rem, 1fr))', gap: '1rem' }}>
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="tp-card" style={{ padding: '1.25rem' }}>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '14px', background: 'rgba(29,78,216,0.1)', display: 'grid', placeItems: 'center' }}>
                    <Icon size={18} color="var(--tp-primary)" />
                  </div>
                  <h3 style={{ margin: '0.9rem 0 0', fontSize: '1.15rem', letterSpacing: '-0.03em' }}>{feature.title}</h3>
                  <p style={{ margin: '0.5rem 0 0', color: 'var(--tp-muted)', lineHeight: 1.6, fontSize: '0.93rem' }}>{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 5rem' }}>
        <div className="tp-container">
          <div className="tp-card-soft" style={{ padding: '2rem' }}>
            <div className="tp-kicker">How hiring works</div>
            <h2 style={{ margin: '0.35rem 0 0', fontSize: 'clamp(1.8rem, 3vw, 2.7rem)', letterSpacing: '-0.04em' }}>From account to hire in three steps.</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
              {steps.map((step, index) => (
                <div key={step.title} style={{ display: 'flex', gap: '0.95rem', padding: '1rem', borderRadius: '18px', background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(148,163,184,0.14)' }}>
                  <div style={{ width: '2.3rem', height: '2.3rem', borderRadius: '999px', background: 'linear-gradient(135deg, var(--tp-primary), #0b3aa7)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 800, flexShrink: 0 }}>{index + 1}</div>
                  <div>
                    <div style={{ fontWeight: 800 }}>{step.title}</div>
                    <div className="tp-lead" style={{ fontSize: '0.96rem', marginTop: '0.25rem' }}>{step.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 5rem' }}>
        <div className="tp-container">
          <div className="tp-card" style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(7,23,46,0.98), rgba(29,78,216,0.9))', color: 'white' }}>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', letterSpacing: '-0.04em' }}>Ready to start hiring?</h2>
            <p style={{ maxWidth: '38rem', margin: '0.9rem auto 0', color: 'rgba(255,255,255,0.82)', lineHeight: 1.7 }}>
              Create your employer account to post your first opening, or reach out to our team with questions about pricing and enterprise plans.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.85rem', marginTop: '1.5rem' }}>
              <Link href="/join-now?role=recruiter" className="tp-btn-secondary">
                Post a Position
              </Link>
              <a href="mailto:careers@trimergeconsulting.com" className="tp-btn-ghost" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
