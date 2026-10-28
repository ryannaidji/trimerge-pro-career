import React, { Suspense } from 'react'
import JoinNowClient from './JoinNowClient'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JoinNowClient />
    </Suspense>
  )
}
