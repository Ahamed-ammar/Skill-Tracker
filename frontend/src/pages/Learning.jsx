import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAnalysis } from '../context/AnalysisContext'
import { useAuth } from '../context/AuthContext'

const statusConfig = {
  'in-progress': { dot: 'bg-[#506454]', label: 'In Progress', badge: 'bg-[#d2e8d4] text-[#435647]' },
  'upcoming':    { dot: 'bg-[#e0e3e0]', label: 'Upcoming',    badge: 'bg-[#e6e9e6] text-[#5c605e]' },
  'locked':      { dot: 'bg-[#e0e3e0]', label: 'Locked',      badge: 'bg-[#e0e3e0] text-[#777c79]' },
}

export default function Learning() {
  const { planId } = useParams()
  const { result } = useAnalysis()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [planData, setPlanData] = useState(null)
  const [fetchState, setFetchState] = useState('idle') // idle | loading | error | forbidden | notfound
  // checked[dayIndex][taskIndex] = bool
  const [checked, setChecked] = useState({})

  useEffect(() => {
    if (!planId) return
    setFetchState('loading')
    setPlanData(null)
    setChecked({})
    fetch(`/api/study-plans/${planId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (r.status === 403) { setFetchState('forbidden'); return null }
        if (r.status === 404) { setFetchState('notfound'); return null }
        if (!r.ok) { setFetchState('error'); return null }
        return r.json()
      })
      .then(data => { if (data) { setPlanData(data); setFetchState('idle') } })
      .catch(() => setFetchState('error'))
  }, [planId, token])

  const toggleTask = (dayIdx, taskIdx) => {
    setChecked(prev => {
      const day = { ...(prev[dayIdx] ?? {}) }
      day[taskIdx] = !day[taskIdx]
      return { ...prev, [dayIdx]: day }
    })
  }

  const countChecked = (weekPlan) =>
    weekPlan.reduce((sum, _, di) =>
      sum + Object.values(checked[di] ?? {}).filter(Boolean).length, 0)

  const countTotal = (weekPlan) =>
    weekPlan.reduce((sum, entry) => sum + (entry.tasks?.length ?? 0), 0)

  // Determine which roadmap to show
  const weekPlan = planId
    ? (planData?.roadmap ?? [])
    : (result?.roadmap ?? [])

  const planName = planId ? planData?.name : null

  // Loading state for plan fetch
  if (planId && fetchState === 'loading') {
    return (
      <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto dot-grid min-h-screen flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-5xl text-[#afb3b0] animate-spin mb-4">autorenew</span>
        <p className="text-[#5c605e] font-['Inter'] text-sm">Loading study plan...</p>
      </main>
    )
  }
  // Error states
  if (planId && fetchState === 'forbidden') {
    return (
      <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto dot-grid min-h-screen flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-[#afb3b0] mb-6">lock</span>
        <h2 className="font-['Newsreader'] text-2xl text-[#2f3332] mb-3">Access Denied</h2>
        <p className="text-[#5c605e] font-['Inter'] text-sm mb-8">This study plan doesn't belong to your account.</p>
        <button onClick={() => navigate('/learning')} className="bg-[#506454] text-[#e8ffea] px-6 py-3 rounded-full font-['Inter'] text-xs tracking-widest uppercase hover:opacity-90 transition-opacity">
          Back to Learning
        </button>
      </main>
    )
  }

  if (planId && (fetchState === 'notfound' || fetchState === 'error')) {
    return (
      <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto dot-grid min-h-screen flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-[#afb3b0] mb-6">search_off</span>
        <h2 className="font-['Newsreader'] text-2xl text-[#2f3332] mb-3">Plan Not Found</h2>
        <p className="text-[#5c605e] font-['Inter'] text-sm mb-8">This study plan could not be loaded.</p>
        <button onClick={() => navigate('/learning')} className="bg-[#506454] text-[#e8ffea] px-6 py-3 rounded-full font-['Inter'] text-xs tracking-widest uppercase hover:opacity-90 transition-opacity">
          Back to Learning
        </button>
      </main>
    )
  }

  // Empty state
  if (!weekPlan.length) {
    return (
      <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto dot-grid min-h-screen flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-[#afb3b0] mb-6">auto_stories</span>
        <h2 className="font-['Newsreader'] text-2xl text-[#2f3332] mb-3">No roadmap yet</h2>
        <p className="text-[#5c605e] font-['Inter'] text-sm mb-8 text-center max-w-sm">
          Upload your resume and paste a job description on the Dashboard to generate your personalized 7-day learning plan.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#506454] text-[#e8ffea] px-6 py-3 rounded-full font-['Inter'] text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
        >
          Go to Dashboard
        </button>
      </main>
    )
  }

  const totalTasks = countTotal(weekPlan)
  const checkedTasks = countChecked(weekPlan)
  const progress = totalTasks > 0 ? Math.round((checkedTasks / totalTasks) * 100) : 0

  return (
    <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto dot-grid min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-[#d2e8d4] text-[#435647] px-4 py-2 rounded-full text-xs font-['Inter'] tracking-widest uppercase mb-4">
          <span className="material-symbols-outlined text-sm">auto_stories</span>
          Learning Roadmap
        </div>
        <h1 className="font-['Newsreader'] text-4xl font-semibold text-[#2f3332] mb-2">
          {planName ?? 'Your 7-Day Skill Plan'}
        </h1>
        <p className="text-[#5c605e] font-['Inter']">Personalized based on your skill gap analysis.</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-[1rem] p-6 mb-10 shadow-sm flex items-center gap-6">
        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-['Inter'] font-medium text-[#2f3332]">Overall Progress</span>
            <span className="text-sm font-['Inter'] text-[#506454] font-semibold">{progress}%</span>
          </div>
          <div className="h-2 bg-[#f3f4f2] rounded-full overflow-hidden">
            <div className="h-full bg-[#506454] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="text-right">
          <div className="font-['Newsreader'] text-3xl font-bold text-[#2f3332]">{checkedTasks}/{totalTasks}</div>
          <div className="text-xs font-['Inter'] tracking-widest uppercase text-[#5c605e]">Complete</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-px before:bg-[#afb3b0]/40">
        {weekPlan.map(({ days, skill, tasks, status }, dayIdx) => {
          const cfg = statusConfig[status] ?? statusConfig['upcoming']
          const dayChecked = checked[dayIdx] ?? {}
          const dayTotal = tasks?.length ?? 0
          const dayDone = Object.values(dayChecked).filter(Boolean).length
          const allDone = dayTotal > 0 && dayDone === dayTotal
          return (
            <div key={days} className="relative">
              <div className={`absolute -left-8 top-6 w-6 h-6 rounded-full ${allDone ? 'bg-[#506454]' : cfg.dot} border-4 border-[#f9f9f7] flex items-center justify-center`}>
                {allDone
                  ? <span className="material-symbols-outlined text-[10px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  : status === 'in-progress' && <span className="w-1.5 h-1.5 rounded-full bg-[#e8ffea]" />}
              </div>
              <div className="bg-white rounded-[1rem] p-8 shadow-sm border border-[#afb3b0]/10 ml-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-['Inter'] tracking-widest uppercase text-[#5c605e] mb-1">{days}</p>
                    <h3 className="font-['Newsreader'] text-xl font-semibold text-[#2f3332]">{skill}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {dayTotal > 0 && (
                      <span className="text-[10px] font-['Inter'] text-[#5c605e]">{dayDone}/{dayTotal}</span>
                    )}
                    <span className={`text-[10px] px-3 py-1 rounded-full font-['Inter'] font-bold uppercase tracking-wider ${allDone ? 'bg-[#d2e8d4] text-[#435647]' : cfg.badge}`}>
                      {allDone ? 'Done' : cfg.label}
                    </span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {(tasks ?? []).map((t, taskIdx) => {
                    const isChecked = !!dayChecked[taskIdx]
                    return (
                      <li
                        key={t}
                        onClick={() => toggleTask(dayIdx, taskIdx)}
                        className="flex items-center gap-3 text-sm text-[#5c605e] cursor-pointer group select-none"
                      >
                        <span
                          className={`material-symbols-outlined text-sm transition-colors flex-shrink-0
                            ${isChecked ? 'text-[#506454]' : 'text-[#afb3b0] group-hover:text-[#506454]/60'}`}
                          style={isChecked ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          {isChecked ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={isChecked ? 'line-through text-[#afb3b0]' : ''}>{t}</span>
                      </li>
                    )
                  })}
                </ul>
                {status === 'in-progress' && !allDone && (
                  <button className="mt-6 bg-[#506454] text-[#e8ffea] px-6 py-3 rounded-full font-['Inter'] text-xs tracking-widest uppercase hover:opacity-90 transition-opacity">
                    Start Learning
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
