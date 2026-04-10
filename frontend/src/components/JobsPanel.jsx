import { useEffect } from 'react'
import { useAnalysis } from '../context/AnalysisContext'

export default function JobsPanel({ jobTitle = '' }) {
  const { jobs, setJobs } = useAnalysis()

  // Only fetch if we don't already have cached results
  useEffect(() => {
    if (!jobTitle || jobs !== null) return

    const fetchJobs = async () => {
      try {
        const res = await fetch(`/api/jobs/search?query=${encodeURIComponent(jobTitle)}&location=Remote&page=1`)
        if (!res.ok) throw new Error('Job search failed')
        const data = await res.json()
        setJobs(data.jobs.slice(0, 5))
      } catch (err) {
        setJobs([])  // cache empty array so we don't retry on every navigation
      }
    }

    fetchJobs()
  }, [jobTitle, jobs, setJobs])

  const loading = jobs === null && !!jobTitle

  return (
    <div className="col-span-12 md:col-span-8 bg-white rounded-[1rem] p-8 shadow-sm">
      <h4 className="font-['Newsreader'] text-xl mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#506454]">work</span>
        Available Jobs
        {jobTitle && <span className="text-sm text-[#5c605e] font-normal ml-2">for {jobTitle}</span>}
      </h4>

      {loading && (
        <div className="flex items-center gap-3 p-4 bg-[#f3f4f2] rounded-[1rem] text-[#5c605e]">
          <span className="material-symbols-outlined animate-spin">autorenew</span>
          <span className="text-sm">Searching jobs...</span>
        </div>
      )}

      {!loading && jobs !== null && jobs.length === 0 && (
        <p className="text-sm text-[#5c605e] italic">No jobs found. Try a different search.</p>
      )}

      {!loading && jobs && jobs.length > 0 && (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 bg-[#f3f4f2] rounded-[1rem] hover:bg-[#d2e8d4]/20 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-['Inter'] text-sm font-semibold text-[#2f3332] mb-1">{job.title}</h5>
                  <p className="text-xs text-[#5c605e]">{job.company} · {job.location}</p>
                </div>
                {job.logo && (
                  <img src={job.logo} alt="" className="w-8 h-8 rounded object-contain bg-white p-1" />
                )}
              </div>
              <p className="text-xs text-[#5c605e] line-clamp-2 mb-3">{job.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] px-2 py-1 bg-[#e6e9e6] text-[#5c605e] rounded-full font-['Inter'] uppercase tracking-wider">
                  {job.type || 'Full-time'}
                </span>
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-['Inter'] text-[#506454] hover:underline flex items-center gap-1"
                  >
                    Apply
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
