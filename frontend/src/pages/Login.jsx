import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-[1.5rem] shadow-[0_40px_40px_-15px_rgba(47,51,50,0.08)] border border-[#afb3b0]/10 p-10">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#2f3332] rounded-[0.75rem] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#c4dac6] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
          </div>
          <span className="font-['Newsreader'] text-xl font-semibold text-[#2f3332]">Curator AI</span>
        </div>

        <h1 className="font-['Newsreader'] text-3xl font-semibold text-[#2f3332] mb-2">Welcome back</h1>
        <p className="text-sm text-[#5c605e] mb-8">Sign in to your account</p>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-[#fa746f]/10 rounded-xl text-[#a83836] text-sm mb-6">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5c605e] mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-[#f3f4f2] rounded-xl px-4 py-3 text-sm text-[#2f3332] outline-none focus:ring-2 focus:ring-[#506454]/40"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5c605e] mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-[#f3f4f2] rounded-xl px-4 py-3 text-sm text-[#2f3332] outline-none focus:ring-2 focus:ring-[#506454]/40"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#2f3332] text-[#e8ffea] py-3 rounded-xl text-sm font-medium tracking-wide hover:bg-[#506454] transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-center text-[#5c605e] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#506454] font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
