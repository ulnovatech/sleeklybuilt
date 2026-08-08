/**
 * Team accounts panel — Settings → Team
 * Design OS: patterns/settings.md + authentication_flow (invite/create)
 */

import { useEffect, useState } from 'react'
import { AuthAPI } from '../services/api'
import PasswordField, { passwordIsValid } from './auth/PasswordField'

function fieldClass(hasError) {
  return `mt-1 w-full rounded-lg border bg-bg-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-purple/60 ${
    hasError ? 'border-rose-500/60' : 'border-gray-700'
  }`
}

export default function TeamUsersPanel({ currentUserId }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('admin')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await AuthAPI.listUsers()
      setUsers(data.users || [])
    } catch (err) {
      setLoadError(err.message || 'Could not load team members.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    setSuccess('')
    if (!passwordIsValid(password)) {
      setFormError('Password must be at least 12 characters and include a number.')
      return
    }
    setSaving(true)
    try {
      await AuthAPI.createUser({
        email: email.trim(),
        display_name: displayName.trim(),
        password,
        role,
      })
      setEmail('')
      setDisplayName('')
      setPassword('')
      setRole('admin')
      setSuccess('Account created. Share the email and temporary password securely.')
      await load()
    } catch (err) {
      setFormError(err.message || 'Could not create account.')
    } finally {
      setSaving(false)
    }
  }

  const onDeactivate = async (id) => {
    if (!window.confirm('Deactivate this account? They will no longer be able to sign in.')) {
      return
    }
    try {
      await AuthAPI.deactivateUser(id)
      setSuccess('Account deactivated.')
      await load()
    } catch (err) {
      setFormError(err.message || 'Could not deactivate account.')
    }
  }

  return (
    <section className="rounded-2xl border border-gray-800 bg-bg-800/80 p-4 sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Team</h2>
      <p className="mt-1 text-sm text-slate-500">
        Create dashboard accounts for colleagues. Public signup stays closed after the first admin unless you enable it in env.
      </p>

      {loading ? (
        <div className="mt-4 h-24 animate-pulse rounded-xl bg-gray-800/60" aria-busy="true" />
      ) : null}

      {loadError ? (
        <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200" role="alert">
          {loadError}
          <button type="button" onClick={load} className="ml-3 underline">
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !loadError ? (
        <ul className="mt-4 divide-y divide-gray-800 rounded-xl border border-gray-800">
          {users.length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate-400">No accounts yet.</li>
          ) : (
            users.map((u) => (
              <li key={u.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    {u.display_name || u.email}
                    {!u.is_active ? (
                      <span className="ml-2 text-xs font-normal text-rose-300">inactive</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500">
                    {u.email} · {u.role}
                  </p>
                </div>
                {u.is_active && u.id !== currentUserId ? (
                  <button
                    type="button"
                    onClick={() => onDeactivate(u.id)}
                    className="min-h-11 rounded-lg border border-gray-700 px-3 text-sm text-slate-300 hover:bg-white/5"
                  >
                    Deactivate
                  </button>
                ) : null}
              </li>
            ))
          )}
        </ul>
      ) : null}

      <form onSubmit={onCreate} className="mt-6 space-y-4 border-t border-gray-800 pt-6" noValidate>
        <h3 className="text-sm font-medium text-slate-200">Add account</h3>
        {formError ? (
          <p className="text-sm text-rose-300" role="alert">
            {formError}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-emerald-300" role="status">
            {success}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="team_email" className="block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="team_email"
              type="email"
              required
              className={fieldClass(false)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="team_name" className="block text-sm font-medium text-slate-200">
              Display name
            </label>
            <input
              id="team_name"
              type="text"
              className={fieldClass(false)}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="team_role" className="block text-sm font-medium text-slate-200">
              Role
            </label>
            <select
              id="team_role"
              className={fieldClass(false)}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </div>
        </div>
        <PasswordField
          id="team_password"
          label="Temporary password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          showRequirements
        />
        <button
          type="submit"
          disabled={saving}
          className="min-h-11 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </section>
  )
}
