"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { ArrowRight, MapPin, Search } from 'lucide-react'



const careerAreas = [
  {
    title: 'Professional Services',
    description: 'Business, financial, and client-facing roles that keep organizations running smoothly.',
    examples: ['Business Analyst', 'Client Services Manager', 'Project Coordinator'],
    image: '/Sector-Images/Professional-Services.png',
  },
  {
    title: 'Government & Public Sector',
    description: 'Roles supporting federal, state, and local government missions and public programs.',
    examples: ['Contract Specialist', 'Program Analyst', 'Policy Advisor'],
    image: '/Sector-Images/Government-Public-Sector.avif',
  },
  {
    title: 'Technology & Digital Solutions',
    description: 'IT, software, and digital transformation roles supporting every industry we serve.',
    examples: ['Software Engineer', 'Systems Administrator', 'IT Support Specialist'],
    image: '/Sector-Images/Technology-Digital-Services.png',
  },
  {
    title: 'Accounting & Finance',
    description: 'Accounting, audit, and financial management roles for public and private organizations.',
    examples: ['Staff Accountant', 'Financial Analyst', 'Auditor'],
    image: '/Sector-Images/Accounting-Finance.jpg',
  },
  {
    title: 'Engineering & Infrastructure',
    description: 'Civil, mechanical, and infrastructure roles building and maintaining critical systems.',
    examples: ['Civil Engineer', 'Project Engineer', 'Infrastructure Planner'],
    image: '/Sector-Images/Engineering-Infrastructure.jpg',
  },
  {
    title: 'Healthcare',
    description: 'Clinical and administrative roles supporting patient care and health systems.',
    examples: ['Registered Nurse', 'Healthcare Administrator', 'Clinical Coordinator'],
    image: '/Sector-Images/Healthcare.webp',
  },
  {
    title: 'Emergency Management & Resiliency',
    description: 'Preparedness, response, and resiliency planning roles for agencies and communities.',
    examples: ['Emergency Management Specialist', 'Resiliency Planner', 'Continuity of Operations Analyst'],
    image: '/Sector-Images/Emergency-Management-Resiliency.png',
  },
  {
    title: 'Administrative & Operations',
    description: 'Administrative, operations, and support roles that keep teams and offices running.',
    examples: ['Executive Assistant', 'Operations Coordinator', 'Office Manager'],
    image: '/Sector-Images/Administrative-Operations.jpeg',
  },
  {
    title: 'Data & Analytics',
    description: 'Data analysis, reporting, and business intelligence roles across sectors.',
    examples: ['Data Analyst', 'Business Intelligence Analyst', 'Research Analyst'],
    image: '/Sector-Images/Data-Analytics.jpg',
  },
  {
    title: 'Leadership & Consulting',
    description: 'Consulting, strategy, and leadership roles guiding organizations through change.',
    examples: ['Management Consultant', 'Program Director', 'Strategy Advisor'],
    image: '/Sector-Images/Leadership-Consulting.jpg',
  },
  {
    title: 'Human Resources',
    description: 'Talent acquisition, HR operations, and workforce management roles across every industry we serve.',
    examples: ['HR Generalist', 'Talent Acquisition Specialist', 'Benefits Administrator'],
    image: '/Sector-Images/Human-Resources.jpg',
  },
  {
    title: 'Nonprofit & Community Services',
    description: 'Roles supporting mission-driven organizations, community programs, and social impact initiatives.',
    examples: ['Program Coordinator', 'Grants Administrator', 'Community Outreach Specialist'],
    image: '/Sector-Images/Nonprofit-Community-Services.jpg',
  },
]

const popularSearches = [
  'Accountant',
  'Administrative Assistant',
  'Business Analyst',
  'Civil Engineer',
  'Customer Service',
  'Data Analyst',
  'Executive Assistant',
  'HR Generalist',
  'IT Support Specialist',
  'Program Manager',
  'Project Manager',
  'Registered Nurse',
  'Remote',
  'Software Engineer',
  'Staff Accountant',
  'Systems Administrator',
]

const steps = [
  {
    title: 'Create your profile',
    text: 'Sign up, upload your resume, and tell us about your experience and career goals.',
  },
  {
    title: 'Search and apply',
    text: 'Browse open roles across every sector we serve and apply in just a few clicks.',
  },
  {
    title: 'Track your applications',
    text: 'Follow your application status and hear from employers, all in one place.',
  },
]

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLocation, setSearchLocation] = useState('')

  const onSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (searchLocation.trim()) params.set('where', searchLocation.trim())
    router.push(`/browse-jobs${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="tp-shell" style={{ overflow: 'hidden' }}>
      <section style={{ padding: '2rem 0 0' }}>
        <div className="tp-container">
          <div className="tp-hero-media" style={{ position: 'relative', overflow: 'hidden', borderRadius: '28px', aspectRatio: '4 / 3' }}>
            <Image
              src="/Sector-Images/Professionals.jpg"
              alt="Diverse professionals shaking hands and collaborating"
              fill
              priority
              sizes="(min-width: 1180px) 1180px, 100vw"
              style={{ objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,23,46,0.55), rgba(7,23,46,0.35))' }} />

            <div className="tp-hero-overlay" style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: '2rem 1.5rem' }}>
              <h1 className="tp-title" style={{ color: 'white', fontSize: 'clamp(2.2rem, 6vw, 4rem)', margin: 0, transform: 'translateY(-1rem)' }}>
                Find Your Next Career Opportunity
              </h1>

              <form onSubmit={onSearchSubmit} className="tp-card tp-hero-search" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', padding: '0.5rem', gap: '0.5rem', maxWidth: '46rem', width: '100%', margin: '4.5rem auto 0' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Job title, keywords, or company"
                  aria-label="Job title, keywords, or company"
                  style={{ flex: '1 1 16rem', minWidth: 0, border: 'none', outline: 'none', background: 'transparent', padding: '0.75rem 1rem', fontSize: '1rem', color: 'var(--tp-ink)' }}
                />
                <span className="tp-hero-search-divider" style={{ width: '1px', height: '1.75rem', background: 'rgba(148,163,184,0.35)', flexShrink: 0 }} aria-hidden="true" />
                <div className="tp-hero-search-location" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 16rem', minWidth: 0 }}>
                  <MapPin size={18} color="var(--tp-muted)" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="City, state, zip code, or remote"
                    aria-label="City, state, zip code, or remote"
                    style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', padding: '0.75rem 0', fontSize: '1rem', color: 'var(--tp-ink)' }}
                  />
                </div>
                <button type="submit" className="tp-btn-primary tp-hero-search-btn" aria-label="Search" style={{ flexShrink: 0 }}>
                  <Search size={16} />
                  Search
                </button>
              </form>

              <div style={{ maxWidth: '46rem', width: '100%', margin: '2.25rem auto 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                  <Search size={14} color="rgba(255,255,255,0.75)" />
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', fontWeight: 700 }}>Popular Searches</span>
                </div>
                <div className="tp-hero-popular" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.6rem' }}>
                  {popularSearches.map((term) => (
                    <span
                      key={term}
                      style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '999px', padding: '0.35rem 0.85rem' }}
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '3rem 0 5rem' }}>
        <div className="tp-container" style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            <div className="auth-span-7" style={{ position: 'relative' }}>
              <div style={{ display: 'grid', gap: '1.5rem', paddingTop: '1rem' }}>
                <div style={{ maxWidth: '46rem' }}>
                  <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--tp-ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    One Workforce Platform
                  </h2>
                  <p style={{ fontSize: '1.08rem', margin: '0.6rem 0 0', maxWidth: '40rem', color: 'var(--tp-ink)', lineHeight: 1.75 }}>
                    TriMergePRO Careers connects talented professionals with employers across government, commercial, nonprofit, healthcare, engineering, technology, and professional services through one workforce platform.
                  </p>
                </div>

                <div>
                  <Link href="/join-now" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: 'var(--tp-primary)', textDecoration: 'none' }}>
                    Create Profile
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="auth-span-5">
              <Image src="/personal_info.svg" alt="Illustration of a professional reviewing their profile and resume" width={618} height={508} style={{ width: '100%', height: 'auto' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            <div className="auth-span-5">
              <Image src="/candidate.svg" alt="Illustration of a candidate exploring career opportunities" width={618} height={508} style={{ width: '100%', height: 'auto' }} />
            </div>

            <div className="auth-span-7" style={{ position: 'relative' }}>
              <div style={{ maxWidth: '46rem', paddingTop: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--tp-ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Why Choose TriMergePRO Careers
                </h2>
                <p style={{ fontSize: '1.08rem', margin: '0.6rem 0 0', maxWidth: '40rem', color: 'var(--tp-ink)', lineHeight: 1.75 }}>
                  TriMergePRO Careers is a trusted professional services firm with opportunities across multiple industries. Secure candidate profiles and an easy application process make it simple to get started, while employer and recruiter tools support hiring on a growing, AI-enabled workforce platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 5rem' }}>
        <div className="tp-container">
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--tp-ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            How It Works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '1.5rem', marginTop: '1.25rem' }}>
            {steps.map((step, index) => (
              <div key={step.title} style={{ display: 'flex', gap: '0.95rem' }}>
                <div style={{ width: '2.3rem', height: '2.3rem', borderRadius: '999px', background: 'linear-gradient(135deg, var(--tp-primary), #0b3aa7)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 800, flexShrink: 0 }}>{index + 1}</div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>{step.title}</div>
                  <div style={{ fontSize: '0.96rem', marginTop: '0.25rem', color: 'var(--tp-ink)', lineHeight: 1.75 }}>{step.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '1rem 0 5rem' }}>
        <div className="tp-container">
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <h2 className="tp-title" style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', margin: 0 }}>Opportunities across the sectors we serve.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(19rem, 1fr))', gap: '1.25rem' }}>
            {careerAreas.slice(0, 6).map((area) => (
              <div key={area.title} className="tp-card tp-sector-tile" style={{ overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3' }}>
                  <Image src={area.image} alt={`${area.title} professional`} fill sizes="(min-width: 1024px) 33vw, 100vw" style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,23,46,0) 45%, rgba(7,23,46,0.78))' }} />
                  <div className="tp-sector-dim" />
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '1.1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{area.title}</h3>
                    <div className="tp-sector-jobs" style={{ display: 'grid', gap: '0.35rem' }}>
                      {area.examples.map((job) => (
                        <span key={job} style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600, fontSize: '0.85rem' }}>{job}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}