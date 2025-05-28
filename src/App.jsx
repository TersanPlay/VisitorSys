import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import VisitorRegistration from './pages/VisitorRegistration'
import Visitors from './pages/Visitors'
import Reports from './pages/Reports'
import Sectors from './pages/Sectors'
import SectorForm from './pages/SectorForm'
import DepartmentList from './pages/DepartmentList'
import DepartmentForm from './pages/DepartmentForm'
import LoadingSpinner from './components/UI/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              user ? (
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/visitors/register" element={<VisitorRegistration />} />
                    <Route path="/visitors/list" element={<Visitors />} />
                    <Route path="/visitors/entry" element={<Visitors />} />
                    <Route path="/sectors" element={<Sectors />} />
                    <Route path="/sectors/add" element={<SectorForm />} />
                    <Route path="/sectors/:id/edit" element={<SectorForm />} />
                    <Route path="/departments" element={<DepartmentList />} />
                    <Route path="/departments/add" element={<DepartmentForm />} />
                    <Route path="/departments/:id/edit" element={<DepartmentForm />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App