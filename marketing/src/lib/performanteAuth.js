const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

async function parseJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export async function performanteLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await parseJson(res)
  if (!res.ok) {
    const err = new Error(data?.error || 'Sign-in failed')
    err.code = data?.hint || res.status
    throw err
  }
  return data
}

export async function performanteLogout() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  }).catch(() => {})
}

export async function performanteMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (res.status === 401) return null
  const data = await parseJson(res)
  if (!res.ok) return null
  return data?.user || null
}

export async function performanteForgotPassword(email) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data?.error || 'Could not start password reset')
  }
  return data
}

export async function performanteResetPassword(token, password) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ token, password }),
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data?.error || 'Could not reset password')
  }
  return data
}
