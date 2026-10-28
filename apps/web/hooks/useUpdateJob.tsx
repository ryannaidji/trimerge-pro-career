import { useState } from 'react'

type UpdateJobPayload = {
  title?: string
  description?: string
  requirements?: string
  location?: string
  employmentType?: string
  department?: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  skills?: string[]
  status?: string
}

export const useUpdateJob = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateJob = async (id: string, payload: UpdateJobPayload): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('tm_token')
      const res = await fetch(`https://trimerge-pro-career.onrender.com/api/v1/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) return true
      setError(data?.message || data?.error || 'Failed to update job')
      return false
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
      return false
    } finally {
      setLoading(false)
    }
  }

  return { updateJob, loading, error, setError }
}
