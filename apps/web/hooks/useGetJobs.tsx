import { useCallback, useState } from 'react'
import { useRefreshToken } from './useAuth'

type GetJobsParams = {
  page?: number 
  limit?: number
  status?: 'OPEN' | 'CLOSED' | 'DRAFT' | string
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | string
  location?: string
  search?: string
}

export const useGetJobs = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { refresh } = useRefreshToken()

  const fetchJobs = useCallback(async (params: GetJobsParams = {}) => {
    setLoading(true)
    setError(null)

    const runRequest = async () => {
      const qs = new URLSearchParams()
      if (params.page !== undefined) qs.append('page', String(params.page))
      if (params.limit !== undefined) qs.append('limit', String(params.limit))
      if (params.status) qs.append('status', String(params.status))
      if (params.employmentType) qs.append('employmentType', String(params.employmentType))
      if (params.location) qs.append('location', params.location)
      if (params.search) qs.append('search', params.search)

      const url = `https://trimerge-pro-career.onrender.com/api/v1/jobs${qs.toString() ? `?${qs.toString()}` : ''}`
      const token = typeof window !== 'undefined' ? localStorage.getItem('tm_token') : null
      const headers: Record<string, string> = {}

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

  
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      const raw = await response.text()
      let data: unknown = raw

      try {
        data = raw ? JSON.parse(raw) : {}
      } catch {
        // keep raw text if backend returns plain text
      }

      return { response, data }
    }

    try {
      let { response, data } = await runRequest()

      if (response.status === 401) {
        const refreshed = await refresh()
        if (refreshed) {
          const retry = await runRequest()
          response = retry.response
          data = retry.data
        }
      }

      if (!response.ok) {
        let message = 'Failed to fetch jobs'
        if (data && typeof data === 'object') {
          const obj = data as Record<string, unknown>
          if (typeof obj.error === 'string') message = obj.error
          else if (typeof obj.message === 'string') message = obj.message
        } else if (typeof data === 'string' && data.trim().length > 0) {
          message = data
        }

        setError(message)
        return null
      }

      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [refresh])

  return { fetchJobs, loading, error, setError } as const
}
