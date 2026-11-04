
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AskTriMergeAI from './components/ui/AskTriMergeAI'
import SessionKeeper from './components/SessionKeeper'
import './styles/index.css'

import React, { ReactNode } from 'react'
import type { Metadata } from 'next'
import { SITE_URL } from './util/siteUrl'
import { Manrope } from 'next/font/google'
import { UserProvider } from '@/contexts/userContext/userContext'

const manrope = Manrope({ subsets: ['latin'], display: 'swap' })

// Default metadata; each route sets its own title through the template (#13)
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TriMergePRO Careers | Government & Commercial Contracting Jobs',
    template: '%s | TriMergePRO Careers',
  },
  description:
    'TriMergePRO Careers connects qualified professionals with government and commercial contracting opportunities. Create a profile, browse jobs and apply online.',
  applicationName: 'TriMergePRO Careers',
  openGraph: {
    type: 'website',
    siteName: 'TriMergePRO Careers',
    title: 'TriMergePRO Careers',
    description: 'Recruiting platform for government and commercial contracting professionals.',
    images: ['/Logo.png'],
  },
  icons: { icon: '/Logo.png' },
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={manrope.className} suppressHydrationWarning>
      <head>
        {/* Disable native browser password-reveal/clear icons (e.g. Edge's built-in
            eye icon) so only our custom toggle button is clickable. Injected as a raw
            style tag because the build's CSS pipeline drops these legacy pseudo-elements. */}
        <style dangerouslySetInnerHTML={{ __html: 'input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { display: none; }' }} />
      </head>
      <body className="tp-shell overflow-x-hidden antialiased" suppressHydrationWarning style={{ backgroundColor: 'var(--tp-bg)', color: 'var(--tp-ink)' }}>
        <UserProvider>
          <SessionKeeper />
          <a href="#content" className="skip-link">Skip to content</a>
          <Navbar />
          <main id="content" tabIndex={-1}>{children}</main>
          <Footer />
          <AskTriMergeAI />
        </UserProvider>
      </body>
    </html>
  )
}

export default Layout