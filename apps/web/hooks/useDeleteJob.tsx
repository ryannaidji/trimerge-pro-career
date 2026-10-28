import { useState } from 'react'

export const useDeleteJob = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteJob = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('tm_token')
      const res = await fetch(`https://trimerge-pro-career.onrender.com/api/v1/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      })
      if (res.ok) return true
      const data = await res.json().catch(() => ({}))
      setError(data?.message || data?.error || 'Failed to delete job')
      return false
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
      return false
    } finally {
      setLoading(false)
    }
  }

  return { deleteJob, loading, error }
}
