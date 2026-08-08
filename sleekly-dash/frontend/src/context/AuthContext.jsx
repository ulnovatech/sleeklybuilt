import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AuthAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
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
      login,
      register,
      forgotPassword,
      resetPassword,
      logout,
      refresh,
    }),
    [user, loading, login, register, forgotPassword, resetPassword, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
