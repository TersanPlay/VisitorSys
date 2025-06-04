import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout/Layout'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard'
import VisitorRegistration from './pages/VisitorRegistration'
import Visitors from './pages/Visitors'
import VisitorEntry from './pages/VisitorEntry'
import Reports from './pages/Reports'
import DepartmentList from './pages/DepartmentList'
import DepartmentForm from './pages/DepartmentForm'
import TabelaGabinete from './pages/TabelaGabinete'
import TabelaDepartamentos from './pages/TabelaDepartamentos'
import AuditLogs from './pages/AuditLogs'
import TotemPage from './pages/TotemPage'
import MeuPerfil from './pages/MeuPerfil'
import LoadingSpinner from './components/UI/LoadingSpinner'
import './App.css'

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
          <Route path="/totem" element={<TotemPage />} />

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
                    <Route path="/visitors/entry" element={<VisitorEntry />} />
                    <Route path="/departments" element={<DepartmentList />} />
                    <Route path="/departments/add" element={<DepartmentForm />} />
                    <Route path="/departments/:id/edit" element={<DepartmentForm />} />
                    <Route path="/tabelagabinete/:id" element={<TabelaGabinete />} />
                    <Route path="/tabeladepartamentos/:id" element={<TabelaDepartamentos />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    <Route path="/profile" element={<MeuPerfil />} />
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