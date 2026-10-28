import { useEffect, useState } from 'react'
import { useUser } from '@/contexts/userContext/userContext'
import { useRefreshToken } from './useAuth'

export const useGetUser = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<unknown>(null)
  const { refresh } = useRefreshToken()
  const { setUser } = useUser()

  useEffect(() => {
    let mounted = true

    const load = async () => {
      if (!mounted) return
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('tm_token')
        // const res = await fetch('/.netlify/functions/getUser', {
      const res = await fetch('https://trimerge-pro-career.onrender.com/api/v1/auth/me', {

          method: 'GET',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        })

        const payload = await res.json().catch(() => ({}))
        if (res.ok) {
          if (!mounted) return
          const user = payload.user ?? payload
          setData(user)
          try { setUser(user) } catch { }
          return
        }

        // If unauthorized try refresh and retry once
        if (res.status === 401) {
          const refreshed = await refresh()
          if (refreshed) {
            const retry = await fetch('https://trimerge-pro-career.onrender.com/api/v1/auth/me', {
              method: 'GET',
              headers: { Authorization: `Bearer ${localStorage.getItem('tm_token')}` },
            })
            const retryData = await retry.json().catch(() => ({}))
            if (retry.ok) {
              if (!mounted) return
              const user = retryData.user ?? retryData
              setData(user)
              try { setUser(user) } catch { }
              return
            }
          }
        }

        if (!mounted) return
        setError(payload?.message || payload?.error || 'Failed to fetch user')
      } catch (err: unknown) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  return { loading, error, setError, data } as const
}

export default useGetUser
