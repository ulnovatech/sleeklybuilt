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
import { AuthAPI } from '../services/api'
import { isClerkConfigured, setClerkTokenGetter } from '../lib/clerkToken'

const AuthContext = createContext(null)

function dashLoginUrl() {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')
  return `${base}login`
}

function PasswordAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await AuthAPI.me()
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (email, password) => {
    const data = await AuthAPI.login(email, password)
    setUser(data.user ?? null)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const data = await AuthAPI.register(payload)
    setUser(data.user ?? null)
    return data
  }, [])

  const forgotPassword = useCallback(async (email) => AuthAPI.forgotPassword(email), [])

  const resetPassword = useCallback(async (token, password) => {
    const data = await AuthAPI.resetPassword(token, password)
    setUser(data.user ?? null)
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await AuthAPI.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      authMode: 'password',
      login,
      register,
      forgotPassword,
      resetPassword,
      logout,
      refresh,
      denyReason: null,
      sessionWarning: null,
    }),
    [user, loading, login, register, forgotPassword, resetPassword, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function ClerkAuthBridge({ children }) {
  const { isLoaded, isSignedIn, getToken } = useClerkSession()
  const { signOut } = useClerk()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [denyReason, setDenyReason] = useState(null)
  const [sessionWarning, setSessionWarning] = useState(null)
  const userRef = useRef(null)
  userRef.current = user

  useEffect(() => {
    setClerkTokenGetter(() => getToken())
    return () => setClerkTokenGetter(null)
  }, [getToken])

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setUser(null)
      setSessionWarning(null)
      setLoading(false)
      return null
    }
    try {
      const data = await AuthAPI.me()
      setUser(data.user ?? null)
      setDenyReason(null)
      setSessionWarning(null)
      return data.user ?? null
    } catch (err) {
      const status = err?.status
      if (status === 401 || status === 403) {
        setUser(null)
        setDenyReason(
          'This account is not on the admin allowlist. Sign in with the operator Clerk user.',
        )
        setSessionWarning(null)
        try {
          await signOut({ redirectUrl: dashLoginUrl() })
        } catch {
          /* ignore */
        }
        return null
      }
      // Transient failures (network, 5xx, 429): keep prior user to avoid login redirect loops
      setSessionWarning(
        status === 429
          ? 'Session check was rate-limited. Retry shortly.'
          : 'Could not refresh session. Showing last known access.',
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
      await signOut({ redirectUrl: dashLoginUrl() })
    } finally {
      setUser(null)
    }
  }, [signOut])

  const value = useMemo(
    () => ({
      user,
      loading: !isLoaded || loading,
      authMode: 'clerk',
      login: async () => {
        throw new Error('Use Clerk Sign-in')
      },
      register: async () => {
        throw new Error('Sign-up is closed')
      },
      forgotPassword: async () => {
        throw new Error('Recover access in Clerk')
      },
      resetPassword: async () => {
        throw new Error('Recover access in Clerk')
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
      <ClerkProvider publishableKey={pk} afterSignOutUrl={dashLoginUrl()}>
        <ClerkAuthBridge>{children}</ClerkAuthBridge>
      </ClerkProvider>
    )
  }
  return <PasswordAuthProvider>{children}</PasswordAuthProvider>
}

/* eslint-disable react-refresh/only-export-components -- useAuth is the public API for this module */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
