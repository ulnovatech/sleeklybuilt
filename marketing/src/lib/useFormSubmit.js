import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { submitForm } from './submitForm'
import { track } from './analytics'

export function useFormSubmit({
  url,
  onSuccess,
  successToast = true,
  analyticsEvent = 'generate_lead',
  analyticsMethod = 'form',
}) {
  const [loading, setLoading] = useState(false)

  const submit = useCallback(
    async (payload) => {
      setLoading(true)
      try {
        const result = await submitForm(url, payload)
        if (successToast) toast.success(result.message || 'Submitted successfully!')
        if (analyticsEvent) track(analyticsEvent, { method: analyticsMethod })
        onSuccess?.(result)
        return result
      } catch (error) {
        toast.error(error.message || 'Something went wrong.')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [url, onSuccess, successToast, analyticsEvent, analyticsMethod],
  )

  return { submit, loading }
}
