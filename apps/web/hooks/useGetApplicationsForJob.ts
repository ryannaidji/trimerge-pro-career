import { useCallback, useEffect, useState } from 'react'
import { useRefreshToken } from './useAuth'

export type ApplicationsForJobParams = {
  page?: number
  limit?: number
  sortBy?: 'newest' | 'oldest' | 'aiScore' | 'aiScoreLow' | string
  recommendation?: string
  confidenceLevel?: string
  aiMatchStatus?: string
  staleOnly?: boolean
}

export const useGetApplicationsForJob = (jobId?: string, params?: ApplicationsForJobParams) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<unknown | null>(null)
  const { refresh } = useRefreshToken()

  const buildUrl = (jobIdParam: string, p?: ApplicationsForJobParams) => {
    const qs = new URLSearchParams()
    if (p?.page !== undefined) qs.set('page', String(p.page))
    if (p?.limit !== undefined) qs.set('limit', String(p.limit))
    if (p?.sortBy) qs.set('sortBy', p.sortBy)
    if (p?.recommendation) qs.set('recommendation', p.recommendation)
    if (p?.confidenceLevel) qs.set('confidenceLevel', p.confidenceLevel)
    if (p?.aiMatchStatus) qs.set('aiMatchStatus', p.aiMatchStatus)
    if (p?.staleOnly !== undefined) qs.set('staleOnly', String(Boolean(p.staleOnly)))
    // const base = '/.netlify/functions/applicationsForJob'
    // const q = qs.toString()
    // return `${base}?jobId=${encodeURIComponent(jobIdParam)}${q ? `&${q}` : ''}`
   const base = 'https://trimerge-pro-career.onrender.com/api/v1/applications/job'
    const q = qs.toString()
    return `${base}/${encodeURIComponent(jobIdParam)}${q ? `?${q}` : ''}`
  }

  const fetchApplications = useCallback(async (overrideJobId?: string, overrideParams?: ApplicationsForJobParams) => {
    const id = overrideJobId ?? jobId
    if (!id) return null
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('tm_token')
      const url = buildUrl(String(id), overrideParams ?? params)
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      })
      const payload = await res.json().catch(() => ({}))
      if (res.ok) {
        setData(payload)
        return payload
      }

      if (res.status === 401) {
        const refreshed = await refresh()
        if (refreshed) {
          const retry = await fetch(buildUrl(String(id), overrideParams ?? params), {
            method: 'GET',
            headers: { Authorization: `Bearer ${localStorage.getItem('tm_token')}` },
          })
          const retryPayload = await retry.json().catch(() => ({}))
          if (retry.ok) {
            setData(retryPayload)
            return retryPayload
          }
        }
      }

      setError(payload?.message || payload?.error || 'Failed to fetch applications')
      return null
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [jobId, params, refresh])

  const serializedParams = JSON.stringify(params ?? {})

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!mounted) return
      if (!jobId) return
      await fetchApplications()
    }
    load()
    return () => { mounted = false }
  }, [jobId, serializedParams, fetchApplications])

  return { loading, error, setError, data, refetch: fetchApplications } as const
}

export default useGetApplicationsForJob
