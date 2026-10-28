import { useState } from 'react'
import { useRefreshToken } from './useAuth'

export const useApplicationAIMatch = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<unknown | null>(null)
  const { refresh } = useRefreshToken()

  const runMatch = async (id: string) => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const token = localStorage.getItem('tm_token')
      const res = await fetch('/.netlify/functions/applicationAIMatch', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      const payload = await res.json().catch(() => ({}))
      if (res.ok) {
        setData(payload)
        return payload
      }

      // try refresh token flow on 401
      if (res.status === 401) {
        const refreshed = await refresh()
        if (refreshed) {
          const retry = await fetch('/.netlify/functions/applicationAIMatch', {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('tm_token')}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          })
          const retryPayload = await retry.json().catch(() => ({}))
          if (retry.ok) {
            setData(retryPayload)
            return retryPayload
          }
        }
      }

      setError(payload?.message || payload?.error || 'AI match failed')
      return null
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, setError, data, runMatch } as const
}

export default useApplicationAIMatch
