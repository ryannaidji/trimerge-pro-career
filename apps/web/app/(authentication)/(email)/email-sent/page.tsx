import React, { Suspense } from 'react'
import EmailSentClient from './EmailSentClient'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <EmailSentClient />
    </Suspense>
  )
}