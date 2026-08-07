import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { submitForm } from './submitForm'

export function useFormSubmit({ url, onSuccess, successToast = true }) {
  const [loading, setLoading] = useState(false)

  const submit = useCallback(
    async (payload) => {
      setLoading(true)
      try {
        const result = await submitForm(url, payload)
        if (successToast) toast.success(result.message || 'Submitted successfully!')
        onSuccess?.(result)
        return result
      } catch (error) {
        toast.error(error.message || 'Something went wrong.')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [url, onSuccess, successToast],
  )

  return { submit, loading }
}
