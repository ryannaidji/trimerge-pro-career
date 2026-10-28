import { useCallback, useState } from 'react'
import { useUser } from '@/contexts/userContext/userContext'

type MeResponse = unknown
type RefreshResponse = unknown

// fetch current user using the checkAuth proxy
export const useMe = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setUser } = useUser()

  const fetchMe = useCallback(async () : Promise<MeResponse | null> => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('tm_token')
      const res = await fetch('https://trimerge-pro-career.onrender.com/api/v1/auth/me', {
        method: 'GET',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data?.message || data?.error || 'Not authenticated'
        setError(msg)
        return null
      }

      // update context with fresh user (no tokens expected here)
      try { setUser(data.user ?? data) } catch (e) { console.warn('setUser failed', e) }
      return data
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [setUser])

  return { fetchMe, loading, error, setError } as const
}

// hook to refresh token using local tm_refresh
export const useRefreshToken = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setUser } = useUser()

  const refresh = useCallback(async (): Promise<RefreshResponse | null> => {
    setLoading(true)
    setError(null)
    try {
      const refreshToken = localStorage.getItem('tm_refresh')
      if (!refreshToken) {
        setError('No refresh token')
        return null
      }

      const res = await fetch('https://trimerge-pro-career.onrender.com/api/v1/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data?.message || data?.error || 'Refresh failed')
        // clear stored tokens as fallback
        localStorage.removeItem('tm_token')
        localStorage.removeItem('tm_refresh')
        try { setUser(null) } catch { /* ignore */ }
        return null
      }

      // Expected shape: { accessToken, refreshToken, user }
      if (data?.accessToken) localStorage.setItem('tm_token', data.accessToken)
      if (data?.refreshToken) localStorage.setItem('tm_refresh', data.refreshToken)

      if (data?.user) {
        try { setUser(data) } catch(e) { console.warn('setUser failed', e) }
      }

      return data
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [setUser])

  return { refresh, loading, error, setError } as const
}

export default useMe
