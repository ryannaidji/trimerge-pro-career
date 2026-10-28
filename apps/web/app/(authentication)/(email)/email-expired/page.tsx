import React, { Suspense } from 'react'
import EmailExpiredClient from './EmailExpiredClient'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <EmailExpiredClient />
    </Suspense>
  )
}