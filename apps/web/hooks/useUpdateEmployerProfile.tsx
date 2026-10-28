import { useState } from 'react'
import { useRefreshToken } from './useAuth'

type UpdatePayload = {
  companyName?: string
  companyWebsite?: string
  companySize?: string
  industry?: string
  yourRole?: string
  companyOverview?: string
  benefitsAndOpportunities?: string
  primaryHiringNeeds?: string[]
}

export const useUpdateEmployerProfile = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { refresh } = useRefreshToken()

  const update = async (payload: UpdatePayload): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('tm_token')
      const res = await fetch('https://trimerge-pro-career.onrender.com/api/v1/employers/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (res.ok) return true

      if (res.status === 401) {
        const refreshed = await refresh()
        if (refreshed) {
          const retry = await fetch('https://trimerge-pro-career.onrender.com/api/v1/employers/me', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('tm_token')}`,
            },
            body: JSON.stringify(payload),
          })
          if (retry.ok) return true
          const retryData = await retry.json().catch(() => ({}))
          setError(retryData?.message || retryData?.error || 'Failed to update profile')
          return false
        }
      }

      setError(data?.message || data?.error || 'Failed to update profile')
      return false
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
      return false
    } finally {
      setLoading(false)
    }
  }

  return { update, loading, error, setError }
}
