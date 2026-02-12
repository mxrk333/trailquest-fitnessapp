import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Login } from './pages/Login'
import { LogActivity } from './pages/LogActivity'
import { AuthProvider } from './providers/AuthProvider'
import { ChatProvider } from './providers/ChatProvider'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TrainerDashboard } from './pages/TrainerDashboard'
import { ProfileSettings } from './pages/ProfileSettings'
import { ClientDetailPage } from './pages/ClientDetailPage'
import { AssignActivity } from './pages/AssignActivity'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ReadinessCard } from '@/components/dashboard/ReadinessCard'
import { MuscleHeatmap } from '@/components/dashboard/MuscleHeatmap'
import { DashboardFeed } from '@/components/dashboard/DashboardFeed'
import { NutritionWidget } from '@/components/dashboard/NutritionWidget'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { AssignedTasksPage } from './pages/AssignedTasksPage'
import { TrainerAssignmentsPage } from './pages/TrainerAssignmentsPage'
import { useAuth } from './providers/AuthProvider'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient()

import { AdminDashboard } from './pages/AdminDashboard'
import { PendingApproval } from './pages/PendingApproval'

function Home() {
  const { profile } = useAuth()

  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  if (profile?.role === 'trainer') {
    if (profile.isApproved === false) {
      return <Navigate to="/pending-approval" replace />
    }
    return <Navigate to="/trainer" replace />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {profile?.displayName || 'Trainee'}
        </h1>
        <p className="text-gray-400">Here's your fitness overview</p>
      </div>

      {/* Top Row - Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReadinessCard />
        <MuscleHeatmap />
      </div>

      {/* Activity Feed */}
      <DashboardFeed />

      {/* Nutrition Widget */}
      <NutritionWidget />
    </div>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatProvider>
          <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1f2e',
                color: '#fff',
                border: '1px rgba(19, 236, 91, 0.2)',
              },
              success: {
                iconTheme: {
                  primary: '#13EC5B',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes with Outlet */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/"
                element={
                  <DashboardLayout>
                    <Home />
                  </DashboardLayout>
                }
              />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              <Route path="/log-activity" element={<LogActivity />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/assigned-tasks" element={<AssignedTasksPage />} />
              <Route path="/trainer-assignments" element={<TrainerAssignmentsPage />} />
              <Route path="/trainer" element={<TrainerDashboard />} />
              <Route path="/trainer/client/:clientId" element={<ClientDetailPage />} />
              <Route path="/assign-activity/:clientId" element={<AssignActivity />} />
              <Route path="/settings" element={<ProfileSettings />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
