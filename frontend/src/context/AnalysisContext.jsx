import { createContext, useContext, useState } from 'react'

const AnalysisContext = createContext(null)

export function AnalysisProvider({ children }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [jobs, setJobs] = useState(null)
  const [planId, setPlanId] = useState(null)  // id of the last saved study plan

  return (
    <AnalysisContext.Provider value={{ result, setResult, loading, setLoading, error, setError, jobs, setJobs, planId, setPlanId }}>
      {children}
    </AnalysisContext.Provider>
  )
}

export const useAnalysis = () => useContext(AnalysisContext)
