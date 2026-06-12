import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Plans() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/study-plans', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setPlans(data)
        setLoading(false)
      })
      .catch(() => {
        setPlans([])
        setLoading(false)
      })
  }, [token])

  const formatDate = (iso) => {
    try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return '' }
  }

  const handleDelete = async (e, planId) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this study plan?')) return

    try {
      const res = await fetch(`/api/study-plans/${planId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setPlans(plans.filter(p => p.id !== planId))
      } else {
        console.error('Failed to delete plan')
      }
    } catch (err) {
      console.error('Error deleting plan:', err)
    }
  }


  if (loading) {
    return (
      <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto dot-grid min-h-screen flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-5xl text-[#afb3b0] animate-spin mb-4">autorenew</span>
        <p className="text-[#5c605e] font-['Inter'] text-sm">Loading plans...</p>
      </main>
    )
  }

  return (
    <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto dot-grid min-h-screen">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-[#d2e8d4] text-[#435647] px-4 py-2 rounded-full text-xs font-['Inter'] tracking-widest uppercase mb-4">
          <span className="material-symbols-outlined text-sm">folder</span>
          Your Plans
        </div>
        <h1 className="font-['Newsreader'] text-4xl font-semibold text-[#2f3332] mb-2">
          Saved Study Plans
        </h1>
        <p className="text-[#5c605e] font-['Inter']">Review your personalized learning plans.</p>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined text-6xl text-[#afb3b0] mb-6">auto_stories</span>
          <h2 className="font-['Newsreader'] text-2xl text-[#2f3332] mb-3">No plans yet</h2>
          <p className="text-[#5c605e] font-['Inter'] text-sm mb-8 text-center max-w-sm">
            Upload your resume and paste a job description on the Dashboard to generate your personalized learning plans.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#506454] text-[#e8ffea] px-6 py-3 rounded-full font-['Inter'] text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.id}
              onClick={() => navigate(`/learning/${plan.id}`)}
              className="bg-white rounded-[1rem] p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-[#afb3b0]/10 flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-[#f3f4f2] w-12 h-12 rounded-full flex items-center justify-center text-[#506454]">
                  <span className="material-symbols-outlined">auto_stories</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-['Inter'] uppercase tracking-widest text-[#5c605e]">
                    {formatDate(plan.created_at)}
                  </span>
                  <button 
                    onClick={(e) => handleDelete(e, plan.id)}
                    className="text-[#afb3b0] hover:text-red-500 transition-colors flex items-center justify-center"
                    title="Delete Plan"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
              <h3 className="font-['Newsreader'] text-xl font-semibold text-[#2f3332] mb-2 line-clamp-2">
                {plan.name}
              </h3>
              <div className="mt-auto pt-6 flex items-center justify-between text-[#506454]">
                <span className="text-sm font-['Inter'] font-medium">View Plan</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
