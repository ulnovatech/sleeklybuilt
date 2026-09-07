import { useCallback, useEffect, useState } from 'react'
import { RequestsAPI } from '../services/api'
import RequestFilter from '../components/RequestFilter'
import RequestTable from '../components/RequestTable'
import RequestDetailsModal from '../components/RequestDetails'

export default function Requests() {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ page: 1, per_page: 25, total: 0 })
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: '',
    q: '',
    sort: 'submitted_at',
    dir: 'desc',
  })
  const [debouncedQ, setDebouncedQ] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q.trim()), 300)
    return () => clearTimeout(t)
  }, [filters.q])

  const load = useCallback(
    async (page = 1) => {
      setLoading(true)
      try {
        const params = {
          type: filters.type,
          sort: filters.sort,
          dir: filters.dir,
          page,
          per_page: meta.per_page,
        }
        if (!params.type) delete params.type
        if (debouncedQ) params.q = debouncedQ
        const res = await RequestsAPI.list(params)
        const data = res.data || res
        setRows(data || [])
        setMeta({
          page: res.page || page,
          per_page: res.per_page || meta.per_page,
          total: res.total || (Array.isArray(data) ? data.length : 0),
        })
      } catch (e) {
        console.error('Requests load failed', e)
        alert('Failed to load requests: ' + (e.message || e))
      } finally {
        setLoading(false)
      }
    },
    [filters.type, filters.sort, filters.dir, debouncedQ, meta.per_page],
  )

  useEffect(() => {
    load(1)
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Requests</h2>
        <RequestFilter value={filters} onChange={setFilters} />
      </div>

      <div className="card">
        <RequestTable rows={rows} loading={loading} onRowClick={setSelected} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          Total: <strong>{meta.total}</strong>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => load(Math.max(1, meta.page - 1))}
            className="inline-flex min-h-11 items-center rounded bg-gray-800 px-4"
          >
            Prev
          </button>
          <div>
            Page {meta.page} / {Math.max(1, Math.ceil(meta.total / meta.per_page || 1))}
          </div>
          <button
            type="button"
            onClick={() => load(meta.page + 1)}
            className="inline-flex min-h-11 items-center rounded bg-gray-800 px-4"
          >
            Next
          </button>
        </div>
      </div>

      {selected ? (
        <RequestDetailsModal item={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  )
}
