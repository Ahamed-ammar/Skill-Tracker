import { createContext, useContext, useState } from 'react'

const AnalysisContext = createContext(null)

export function AnalysisProvider({ children }) {
  const [result, setResult] = useState(null)   // full API response
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [jobs, setJobs] = useState(null)        // cached job listings — null = not fetched yet

  return (
    <AnalysisContext.Provider value={{ result, setResult, loading, setLoading, error, setError, jobs, setJobs }}>
      {children}
    </AnalysisContext.Provider>
  )
}

export const useAnalysis = () => useContext(AnalysisContext)
