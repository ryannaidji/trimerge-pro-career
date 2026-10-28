import { useCallback, useEffect, useState } from 'react'
import { useRefreshToken } from './useAuth'

export const useGetEmployer = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<unknown>(null)
  const { refresh } = useRefreshToken()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('tm_token')
      const res = await fetch('https://trimerge-pro-career.onrender.com/api/v1/employers/me', {
        method: 'GET',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      })

      const payload = await res.json().catch(() => ({}))
      if (res.ok) {
        const employer = payload.employer ?? payload
        setData(employer)
        return
      }

      // If unauthorized try refresh and retry once
      if (res.status === 401) {
        const refreshed = await refresh()
        if (refreshed) {
          const retry = await fetch('https://trimerge-pro-career.onrender.com/api/v1/employers/me', {
            method: 'GET',
            headers: { Authorization: `Bearer ${localStorage.getItem('tm_token')}` },
          })
          const retryData = await retry.json().catch(() => ({}))
          if (retry.ok) {
            const employer = retryData.employer ?? retryData
            setData(employer)
            return
          }
        }
      }

      setError(payload?.message || payload?.error || 'Failed to fetch employer')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [refresh])

  useEffect(() => {
    load()
  }, [load])

  return { loading, error, setError, data, refetch: load } as const
}

export default useGetEmployer
