"use client"

import Link from 'next/link';
import {
  Search, Briefcase,
  DollarSign, CheckCircle, Users, Award,
  Heart, Lightbulb, Trophy,
  GraduationCap,
} from 'lucide-react';

const jobListings = [
  { id: 1, title: 'Senior Cloud Architect', category: 'Cloud', location: 'Tallahassee, FL', type: 'Full-time', salary: '$120k - $160k', client: 'Florida Dept. of Technology', clearance: 'Secret', posted: '2 days ago' },
  { id: 2, title: 'Cybersecurity Analyst', category: 'Security', location: 'Miami, FL', type: 'Contract', salary: '$95k - $125k', client: 'Enterprise Healthcare System', clearance: 'None', posted: '1 week ago' },
];

const coreValues = [
  { icon: Heart, title: 'People First', description: 'We prioritize the well-being and growth of our team members above all else.', color: '#fee2e2', textColor: '#dc2626' },
  { icon: Lightbulb, title: 'Innovation Driven', description: 'We encourage creative thinking and bold ideas that push boundaries.', color: '#fef9c3', textColor: '#ca8a04' },
  { icon: Users, title: 'Collaborative Spirit', description: 'We believe the best work happens when we work together as one team.', color: '#dbeafe', textColor: '#2563eb' },
];

const benefits = [
  { icon: DollarSign, title: 'Competitive Compensation', items: ['Market-leading salaries', 'Annual performance bonuses', 'Equity packages'] },
  { icon: GraduationCap, title: 'Learning & Development', items: ['$3,000 annual learning budget', 'Internal mentorship', 'Conference attendance'] },
  { icon: Briefcase, title: 'Work-Life Balance', items: ['Flexible work arrangements', 'Unlimited PTO policy', 'Remote-first culture'] },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased text-gray-900">
      <section style={{ paddingTop: '5rem', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', background: 'linear-gradient(to bottom right, #07172e, #1d4ed8)' }}>
        <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ color: 'white' }}>
              <div className="tp-chip" style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.12)', color: 'white', borderColor: 'rgba(255,255,255,0.15)' }}>About TriMergePro</div>
              <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.6rem)', margin: '1rem 0 1rem', letterSpacing: '-0.05em', lineHeight: 1.02 }}>A careers platform with sharper flows and cleaner handoffs.</h1>
              <p style={{ fontSize: '1.08rem', color: 'rgba(255,255,255,0.86)', lineHeight: 1.75, maxWidth: '42rem' }}>
                TriMergePro is the front door for candidates and employers who need structured onboarding, job discovery, and applicant review without the clutter that usually slows hiring down.
              </p>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: '1.25rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.22)', padding: '2rem', border: '1px solid rgba(255,255,255,0.35)' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#111827', marginBottom: '1.25rem' }}>By the numbers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Candidate journeys', val: '3 core flows', tone: '#2563eb' },
                  { label: 'Employer workflows', val: 'Unified dashboard', tone: '#16a34a' },
                  { label: 'Email recovery paths', val: 'Verified and routed', tone: '#9333ea' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{stat.label}</span>
                      <span style={{ color: stat.tone, fontWeight: 700 }}>{stat.val}</span>
                    </div>
                    <div style={{ height: '0.5rem', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '100%', background: `linear-gradient(to right, ${stat.tone}, rgba(255,255,255,0.4))` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: '4.5rem', paddingBottom: '5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#2563eb', borderRadius: '0.5rem' }}>
              <Award style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
            </div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Why TriMerge?</h2>
          </div>
          <p style={{ color: '#4b5563', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '48rem' }}>
            TriMerge Consulting Group is a consulting, accounting, staffing, and technology solutions firm serving government, nonprofit, and commercial clients.
          </p>
          <p style={{ color: '#4b5563', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '48rem', marginTop: '0.85rem' }}>
            For more than two decades we have helped organizations solve business challenges while connecting talented professionals with meaningful opportunities.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: '0', paddingBottom: '5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#2563eb', borderRadius: '0.5rem' }}>
              <Heart style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
            </div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Core values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6" style={{ margin: 0 }}>
            {coreValues.map((value) => (
              <div key={value.title} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' ,  marginBottom: '2rem'}}>
                <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: value.color, color: value.textColor, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <value.icon style={{ width: '1.75rem', height: '1.75rem' }} />
                </div>
                <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>{value.title}</h3>
                <p style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: 1.5 }}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: '5rem', paddingBottom: '5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#2563eb', borderRadius: '0.5rem' }}>
              <Trophy style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
            </div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Benefits and perks</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6" style={{ margin: 0 }}>
            {benefits.map((benefit) => (
              <div key={benefit.title} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e5e7eb',  marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: '0.5rem' }}>
                    <benefit.icon style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb' }} />
                  </div>
                  <h3 style={{ fontWeight: 600 }}>{benefit.title}</h3>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {benefit.items.map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                      <div style={{ width: '0.375rem', height: '0.375rem', backgroundColor: '#2563eb', borderRadius: '50%' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '64rem', marginLeft: 'auto', marginRight: 'auto', background: 'linear-gradient(to right, #2563eb, #4338ca)', borderRadius: '1.5rem', padding: '3rem', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '1rem', color: 'white' }}>Ready to explore the next step?</h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: 0.9 }}>Jump into jobs, onboarding, or employer review without losing the thread.</p>
          <Link href="/browse-jobs" style={{ padding: '1rem 2.5rem', backgroundColor: 'white', color: '#2563eb', fontWeight: 700, borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}>
            View open positions
          </Link>
        </div>
      </section>
    </div>
  );
}