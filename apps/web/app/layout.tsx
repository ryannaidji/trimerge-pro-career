
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AskTriMergeAI from './components/ui/AskTriMergeAI'
import './styles/index.css'

import React, { ReactNode } from 'react'
import { Manrope } from 'next/font/google'
import { UserProvider } from '@/contexts/userContext/userContext'

const manrope = Manrope({ subsets: ['latin'], display: 'swap' })

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