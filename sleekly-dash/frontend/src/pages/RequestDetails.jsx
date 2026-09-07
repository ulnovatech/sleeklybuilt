import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RequestsAPI } from '../services/api'

/**
 * Full-page request detail — route: /requests/:type/:id
 */
export default function RequestDetailsPage() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [converting, setConverting] = useState(false)

  const load = useCallback(async () => {
    if (!type || !id) {
      setError('Missing request type or id.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const r = await RequestsAPI.get(type, id)
      setRequest(r?.data ?? r)
    } catch (e) {
      setError(e.message || 'Could not load request.')
      setRequest(null)
    } finally {
      setLoading(false)
    }
  }, [type, id])

  useEffect(() => {
    load()
  }, [load])

  async function handleConvert() {
    if (!id || !confirm('Convert this request into a company?')) return
    setConverting(true)
    try {
      const res = await RequestsAPI.convertToCompany(id)
      navigate(`/companies/${res.company_id}`)
    } catch (e) {
      setError(e.message || 'Conversion failed.')
    } finally {
      setConverting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6" aria-busy="true">
        <div className="h-7 w-48 animate-pulse rounded bg-slate-800" />
        <div className="h-40 animate-pulse rounded-xl bg-slate-800/70" />
      </div>
    )
  }

  if (error && !request) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-rose-300" role="alert">
          {error}
        </p>
        <Link to="/requests" className="inline-flex min-h-11 items-center text-indigo-300 underline">
          Back to requests
        </Link>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="p-6 text-muted">
        Request not found.{' '}
        <Link to="/requests" className="text-indigo-300 underline">
          Back
        </Link>
      </div>
    )
  }

  const title = request.name || request.email || `Request #${id}`

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <Link
          to="/requests"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-gray-800 px-4 text-sm text-white hover:bg-gray-700"
        >
          Back
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-2 rounded-xl bg-white/5 p-4 text-sm text-slate-200 shadow">
        <p>
          <strong>Type:</strong> {request.request_type || type}
        </p>
        <p>
          <strong>Phone:</strong> {request.phone || '—'}
        </p>
        <p>
          <strong>Email:</strong> {request.email || '—'}
        </p>
        <p>
          <strong>Description:</strong> {request.description || request.message || '—'}
        </p>
        <p>
          <strong>Submitted:</strong> {request.submitted_at || '—'}
        </p>
      </div>

      <button
        type="button"
        onClick={handleConvert}
        disabled={converting}
        className="inline-flex min-h-11 items-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow hover:bg-emerald-700 disabled:opacity-50"
      >
        {converting ? 'Converting…' : 'Convert to company'}
      </button>
    </div>
  )
}
