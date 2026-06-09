import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState(null)   // null = loading, [] = empty, [...] = loaded
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch('/api/study-plans', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setPlans(data))
      .catch(() => setPlans([]))
  }, [token])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatDate = (iso) => {
    try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }
    catch { return '' }
  }

  return (
    <aside className="hidden xl:flex flex-col py-10 h-screen w-72 fixed left-0 top-0 bg-[#e0e3e0] z-40 overflow-y-auto">
      <div className="px-10 mb-12">
        <div className="text-xl font-['Newsreader'] text-[#222222]">The Curator</div>
        <div className="text-[10px] font-['Inter'] tracking-widest uppercase text-[#506454] mt-1">AI Career Strategist</div>
      </div>

      <nav className="flex-1 space-y-1">
        {/* Overview */}
        <NavLink to="/" end>
          {({ isActive }) => (
            <div className={`flex items-center gap-4 py-4 font-['Inter'] text-sm tracking-wide uppercase cursor-pointer transition-all
              ${isActive ? 'bg-[#f9f9f7] text-[#506454] rounded-l-full ml-4 pl-6' : 'text-[#2f3332]/70 pl-10 hover:bg-[#f9f9f7]/50'}`}>
              <span className="material-symbols-outlined">dashboard</span>
              <span>Overview</span>
            </div>
          )}
        </NavLink>

        {/* Learning — expandable */}
        <div>
          <NavLink to="/learning" end>
            {({ isActive }) => (
              <div
                className={`flex items-center gap-4 py-4 font-['Inter'] text-sm tracking-wide uppercase cursor-pointer transition-all
                  ${isActive ? 'bg-[#f9f9f7] text-[#506454] rounded-l-full ml-4 pl-6' : 'text-[#2f3332]/70 pl-10 hover:bg-[#f9f9f7]/50'}`}
                onClick={(e) => { e.preventDefault(); setOpen(o => !o); navigate('/learning') }}
              >
                <span className="material-symbols-outlined">auto_stories</span>
                <span className="flex-1">Learning</span>
                <span className="material-symbols-outlined text-sm mr-4 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  expand_more
                </span>
              </div>
            )}
          </NavLink>

          {/* Study plan folders */}
          {open && (
            <div className="pl-14 pr-4 pb-2 space-y-1">
              {plans === null && (
                <div className="flex items-center gap-2 py-2 text-[#afb3b0]">
                  <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
                  <span className="text-[10px] font-['Inter'] uppercase tracking-wider">Loading...</span>
                </div>
              )}
              {plans !== null && plans.length === 0 && (
                <p className="text-[10px] font-['Inter'] text-[#afb3b0] uppercase tracking-wider py-2">No plans yet</p>
              )}
              {plans !== null && plans.map(plan => (
                <NavLink key={plan.id} to={`/learning/${plan.id}`}>
                  {({ isActive }) => (
                    <div className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors
                      ${isActive ? 'bg-[#d2e8d4] text-[#435647]' : 'text-[#5c605e] hover:bg-[#f9f9f7]'}`}>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>folder</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-['Inter'] font-medium truncate">{plan.name}</p>
                        <p className="text-[9px] font-['Inter'] text-[#afb3b0]">{formatDate(plan.created_at)}</p>
                      </div>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Skill Gap */}
        <NavLink to="/tracker">
          {({ isActive }) => (
            <div className={`flex items-center gap-4 py-4 font-['Inter'] text-sm tracking-wide uppercase cursor-pointer transition-all
              ${isActive ? 'bg-[#f9f9f7] text-[#506454] rounded-l-full ml-4 pl-6' : 'text-[#2f3332]/70 pl-10 hover:bg-[#f9f9f7]/50'}`}>
              <span className="material-symbols-outlined">shutter_speed</span>
              <span>Skill Gap</span>
            </div>
          )}
        </NavLink>
      </nav>

      <div className="px-10 mt-auto pt-10 space-y-4">
        <div className="flex items-center gap-3 text-[#5c605e]/70 cursor-pointer hover:text-[#506454] transition-colors">
          <span className="material-symbols-outlined text-sm">help_outline</span>
          <span className="text-xs uppercase tracking-tighter">Support</span>
        </div>
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 text-[#5c605e]/70 cursor-pointer hover:text-[#506454] transition-colors"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          <span className="text-xs uppercase tracking-tighter">Sign Out</span>
        </div>
      </div>
    </aside>
  )
}
