import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RequestsAPI } from '../services/api'

/**
 * Modal request detail — opened from the requests list.
 * Expects list row shape: request_type, source_id, name, email, phone, description, submitted_at.
 */
export default function RequestDetailsModal({ item, onClose }) {
  const [converting, setConverting] = useState(false)
  const [converted, setConverted] = useState(false)
  const [error, setError] = useState(null)

  if (!item) return null

  const type = item.request_type || item.type || ''
  const id = item.source_id ?? item.id
  const detailPath =
    type && id != null ? `/requests/${encodeURIComponent(type)}/${encodeURIComponent(id)}` : null

  async function handleConvert() {
    if (id == null) return
    setConverting(true)
    setError(null)
    try {
      await RequestsAPI.convertToCompany(id)
      setConverted(true)
    } catch (e) {
      setError(e.message || 'Failed to convert request.')
    } finally {
      setConverting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-details-title"
    >
      <div className="w-full max-w-lg space-y-4 rounded-2xl bg-gray-900 p-6 text-white shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h3 id="request-details-title" className="text-xl font-semibold">
            Request details
          </h3>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <strong>ID:</strong> {id ?? '—'}
          </div>
          <div>
            <strong>Type:</strong> {type || '—'}
          </div>
          <div>
            <strong>Name:</strong> {item.name || '—'}
          </div>
          <div>
            <strong>Email:</strong> {item.email || '—'}
          </div>
          <div>
            <strong>Phone:</strong> {item.phone || '—'}
          </div>
          <div>
            <strong>Message:</strong> {item.description || item.message || '—'}
          </div>
          <div>
            <strong>Submitted:</strong> {item.submitted_at || '—'}
          </div>
        </div>

        {error ? (
          <div className="text-sm text-red-400" role="alert">
            {error}
          </div>
        ) : null}

        {converted ? (
          <div className="font-semibold text-green-400">Converted to company successfully.</div>
        ) : (
          <div className="flex flex-wrap justify-end gap-3">
            {detailPath ? (
              <Link
                to={detailPath}
                className="inline-flex min-h-11 items-center rounded-lg bg-slate-700 px-4 text-sm text-white hover:bg-slate-600"
              >
                Open full page
              </Link>
            ) : null}
            <button
              type="button"
              onClick={handleConvert}
              disabled={converting}
              className="inline-flex min-h-11 items-center rounded-lg bg-indigo-600 px-4 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {converting ? 'Converting…' : 'Convert to company'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center rounded-lg bg-gray-700 px-4 text-sm text-white hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
