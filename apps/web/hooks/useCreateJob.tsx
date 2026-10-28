import { useState } from 'react'

type CreateJobPayload = {
  title: string
  description: string
  requirements: string
  location: string
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  skills?: string[]
  department?: string
  status?: 'OPEN' | 'CLOSED' | 'DRAFT' | string
}

export const useCreateJob = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createJob = async (payload: CreateJobPayload) => {
    setLoading(true)
    setError(null)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('tm_token') : null
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('https://trimerge-pro-career.onrender.com/api/v1/jobs', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        const message = data?.error || data?.message || 'Failed to create job'
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
  }

  return { createJob, loading, error, setError } as const
}
