import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)      // { id, email, created_at }
  const [token, setToken] = useState(() => localStorage.getItem('curator_token'))
  const [loading, setLoading] = useState(!!localStorage.getItem('curator_token'))

  // On mount, verify stored token
  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setUser(data))
      .catch(() => { localStorage.removeItem('curator_token'); setToken(null) })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Login failed')
    }
    const { access_token } = await res.json()
    localStorage.setItem('curator_token', access_token)
    setToken(access_token)
    const me = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${access_token}` } })
    setUser(await me.json())
  }

  const register = async (email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Registration failed')
    }
    const { access_token } = await res.json()
    localStorage.setItem('curator_token', access_token)
    setToken(access_token)
    const me = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${access_token}` } })
    setUser(await me.json())
  }

  const logout = () => {
    localStorage.removeItem('curator_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
