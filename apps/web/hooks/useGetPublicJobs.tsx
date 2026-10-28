import { useCallback, useState } from 'react'

type GetJobsParams = {
  page?: number
  limit?: number
  status?: 'OPEN' | 'CLOSED' | 'DRAFT' | string
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | string
  department?: 'ENGINEERING' | 'MARKETING' | 'HR' | 'SALES' | 'DESIGN' | string
  location?: string
  search?: string
}

export type PublicJob = {
  _id: string
  id?: string
  employerId?: string
  title: string
  description: string
  requirements?: string
  location?: string
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  department?: 'ENGINEERING' | 'MARKETING' | 'HR' | 'SALES' | 'DESIGN'
  salaryMin?: number
  salaryMax?: number
  currency?: string
  skills?: string[]
  benefits?: string[]
  applicationQuestions?: string[]
  status?: 'OPEN' | 'CLOSED' | 'DRAFT'
  createdAt?: string
  updatedAt?: string
}

type ListJobsResponse = {
  jobs: PublicJob[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

const BASE_URL = 'https://trimerge-pro-career.onrender.com/api/v1/public/jobs'

export const useGetPublicJobs = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = useCallback(async (params: GetJobsParams = {}) => {
    setLoading(true)
    setError(null)

    try {
      const qs = new URLSearchParams()
      // Backend bug: validateRequest only coerces req.body, but the controller reads
      // raw req.query, so page/limit must always be sent explicitly as numbers.
      qs.append('page', String(params.page ?? 1))
      qs.append('limit', String(params.limit ?? 50))
      if (params.status) qs.append('status', String(params.status))
      if (params.employmentType) qs.append('employmentType', String(params.employmentType))
      if (params.department) qs.append('department', String(params.department))
      if (params.location) qs.append('location', params.location)
      if (params.search) qs.append('search', params.search)

      const url = `${BASE_URL}?${qs.toString()}`

      const response = await fetch(url, { method: 'GET' })
      const raw = await response.text()
      let data: unknown = raw

      try {
        data = raw ? JSON.parse(raw) : {}
      } catch {
        // keep raw text
      }

      if (!response.ok) {
        let message = 'Failed to fetch public jobs'
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

      return data as ListJobsResponse
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchJobById = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const url = `${BASE_URL}/${encodeURIComponent(id)}`
      const response = await fetch(url, { method: 'GET' })
      const raw = await response.text()
      let data: unknown = raw

      try {
        data = raw ? JSON.parse(raw) : {}
      } catch {
        // keep raw text
      }

      if (!response.ok) {
        let message = response.status === 404 ? 'Job not found' : 'Failed to fetch job'
        if (data && typeof data === 'object') {
          const obj = data as Record<string, unknown>
          if (typeof obj.message === 'string') message = obj.message
        }
        setError(message)
        return null
      }

      const obj = data as { job?: PublicJob }
      return obj.job ?? null
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { fetchJobs, fetchJobById, loading, error, setError } as const
}
