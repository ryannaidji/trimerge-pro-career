import React, { Suspense } from 'react'
import CandidateOverviewClient from './CandidateOverviewClient'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CandidateOverviewClient />
    </Suspense>
  )
}