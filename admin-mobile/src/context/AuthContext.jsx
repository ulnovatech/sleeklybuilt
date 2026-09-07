import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ClerkProvider,
  useAuth as useClerkSession,
  useClerk,
} from '@clerk/clerk-react'
import {
  apiFetch,
  clearToken,
  getToken,
  setToken,
} from '../services/api'
import { isClerkConfigured, setClerkTokenGetter } from '../lib/clerkToken'

const AuthContext = createContext(null)

function PasswordAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const token = await getToken()
    if (!token) {
      setUser(null)
      return null
    }

    try {
      const data = await apiFetch('/auth/mobile/me')
      setUser(data.user ?? data)
      return data.user ?? data
    } catch {
      await clearToken()
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        await refresh()
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [refresh])

  const login = useCallback(async (username, password) => {
    const data = await apiFetch('/auth/mobile/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })

    if (!data.token) {
      throw new Error('Login did not return a token')
    }

    await setToken(data.token)
    setUser(data.user ?? null)
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/mobile/logout', { method: 'POST', body: '{}' })
    } catch {
      // Stateless logout — clear local token regardless
    }
    await clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      authMode: 'password',
      login,
      logout,
      refresh,
      denyReason: null,
      sessionWarning: null,
    }),
    [user, loading, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function ClerkAuthBridge({ children }) {
  const { isLoaded, isSignedIn, getToken: getClerkJwt } = useClerkSession()
  const { signOut } = useClerk()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [denyReason, setDenyReason] = useState(null)
  const [sessionWarning, setSessionWarning] = useState(null)
  const userRef = useRef(null)
  userRef.current = user

  useEffect(() => {
    setClerkTokenGetter(() => getClerkJwt())
    // One-time clear of any stale Preferences JWT left from password mode
    clearToken().catch(() => {})
    return () => setClerkTokenGetter(null)
  }, [getClerkJwt])

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setUser(null)
      setSessionWarning(null)
      setLoading(false)
      return null
    }
    try {
      const data = await apiFetch('/auth/mobile/me')
      setUser(data.user ?? data)
      setDenyReason(null)
      setSessionWarning(null)
      return data.user ?? data
    } catch (err) {
      const status = err?.status
      if (status === 401 || status === 403) {
        setUser(null)
        setDenyReason(
          'This account is not on the admin allowlist. Use the operator Clerk user.',
        )
        setSessionWarning(null)
        try {
          await signOut()
        } catch {
          /* ignore */
        }
        return null
      }
      setSessionWarning(
        'Could not refresh your session. Check the network and try again.',
      )
      return userRef.current
    } finally {
      setLoading(false)
    }
  }, [isSignedIn, signOut])

  useEffect(() => {
    if (!isLoaded) return
    if (!userRef.current) setLoading(true)
    refresh()
  }, [isLoaded, isSignedIn, refresh])

  const logout = useCallback(async () => {
    try {
      await signOut()
    } finally {
      setUser(null)
    }
  }, [signOut])

  const value = useMemo(
    () => ({
      user,
      loading: !isLoaded || loading,
      isAuthenticated: Boolean(user),
      authMode: 'clerk',
      login: async () => {
        throw new Error('Use Clerk Sign-in')
      },
      logout,
      refresh,
      denyReason,
      sessionWarning,
    }),
    [user, isLoaded, loading, logout, refresh, denyReason, sessionWarning],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }) {
  const pk = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  if (isClerkConfigured() && pk) {
    return (
      <ClerkProvider publishableKey={pk} afterSignOutUrl="/login">
        <ClerkAuthBridge>{children}</ClerkAuthBridge>
      </ClerkProvider>
    )
  }
  return <PasswordAuthProvider>{children}</PasswordAuthProvider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
