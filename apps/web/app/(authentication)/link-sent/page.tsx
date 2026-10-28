import React, { Suspense } from 'react'
import LinkSentClient from './LinkSentClient'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LinkSentClient />
    </Suspense>
  )
}