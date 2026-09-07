import { Preferences } from '@capacitor/preferences'
import { API_BASE } from '../site.config'
import { getClerkBearerToken, isClerkConfigured } from '../lib/clerkToken'

const TOKEN_KEY = 'uln_admin_token'

export async function getToken() {
  const { value } = await Preferences.get({ key: TOKEN_KEY })
  return value || null
}

export async function setToken(token) {
  await Preferences.set({ key: TOKEN_KEY, value: token })
}

export async function clearToken() {
  await Preferences.remove({ key: TOKEN_KEY })
}

export class ApiError extends Error {
  constructor(message, status, payload = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export async function apiFetch(path, options = {}) {
  let token = null
  if (isClerkConfigured()) {
    // Never fall back to Preferences JWT when Clerk SSO is the auth mode.
    token = await getClerkBearerToken()
  } else {
    token = await getToken()
  }

  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }

  const hasBody = options.body != null && options.body !== ''
  if (hasBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, { ...options, headers })

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }
  }

  if (!res.ok) {
    const message =
      data?.error || data?.message || `Request failed (${res.status})`
    throw new ApiError(message, res.status, data)
  }

  return data
}
