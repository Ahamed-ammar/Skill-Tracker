import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { label: 'Dashboard', to: '/' },
  { label: 'Plans', to: '/plans' },
  { label: 'Tracker', to: '/tracker' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#f9f9f7]/80 backdrop-blur-xl shadow-[0_40px_40px_-15px_rgba(47,51,50,0.04)]">
      <div className="flex justify-between items-center px-12 py-6 max-w-[1920px] mx-auto">
        <div className="text-2xl font-['Newsreader'] italic text-[#222222]">Curator AI</div>

        <div className="hidden md:flex gap-10">
          {links.map(({ label, to }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {({ isActive }) => (
                <span className={`font-['Newsreader'] italic text-lg tracking-tight transition-colors duration-300 cursor-pointer
                  ${isActive
                    ? 'text-[#506454] border-b-2 border-[#506454] pb-1'
                    : 'text-[#2f3332]/60 hover:text-[#506454]'}`}>
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#e6e9e6] px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-sm text-[#506454]">person</span>
              <span className="text-xs font-['Inter'] text-[#2f3332] max-w-[140px] truncate">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-['Inter'] text-[#5c605e] hover:bg-[#fa746f]/10 hover:text-[#a83836] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#e5e2e1] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#506454]">person</span>
          </div>
        )}
      </div>
    </nav>
  )
}
