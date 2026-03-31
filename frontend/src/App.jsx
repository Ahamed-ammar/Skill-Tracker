import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnalysisProvider } from './context/AnalysisContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Learning from './pages/Learning'
import Tracker from './pages/Tracker'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnalysisProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-[#f9f9f7]">
                  <Navbar />
                  <Sidebar />
                  <div className="xl:pl-72">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/learning" element={<Learning />} />
                      <Route path="/tracker" element={<Tracker />} />
                      <Route path="*" element={<Dashboard />} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </AnalysisProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
