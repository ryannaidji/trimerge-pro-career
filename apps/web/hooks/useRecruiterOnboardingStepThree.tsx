import { useState } from 'react'

type Payload = {
  companyOverview: string
  benefitsAndOpportunities: string
  primaryHiringNeeds: string
}

export const useRecruiterOnboardingStepThree = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (data: Payload) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`https://trimerge-pro-career.onrender.com/api/v1/onboarding/recruiter/step-3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('tm_token')}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (!response.ok) {
        const message = result?.error || result?.message || 'Could not complete recruiter onboarding step 3'
        setError(message)
        return null
      }

      return result
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error, setError } as const
}
