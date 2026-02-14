import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Shared
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/shared/components/layout/ProtectedRoute'

// Auth feature
import { AuthProvider, useAuth } from '@/features/auth/providers/AuthProvider'
import { Login } from '@/features/auth/pages/Login'
import { Signup } from '@/features/auth/pages/Signup'

// Chat feature
import { ChatProvider } from '@/features/chat/providers/ChatProvider'

// Onboarding feature
import { Onboarding } from '@/features/onboarding/pages/Onboarding'

// Dashboard feature
import { ReadinessCard } from '@/features/dashboard/components/ReadinessCard'
import { MuscleHeatmap } from '@/features/dashboard/components/MuscleHeatmap'
import { DashboardFeed } from '@/features/dashboard/components/DashboardFeed'
import { NutritionWidget } from '@/features/dashboard/components/NutritionWidget'

// Activity feature
import { LogActivity } from '@/features/activity/pages/LogActivity'
import { AssignedTasksPage } from '@/features/activity/pages/AssignedTasksPage'

// Trainer feature
import { TrainerDashboard } from '@/features/trainer/pages/TrainerDashboard'
import { ClientDetailPage } from '@/features/trainer/pages/ClientDetailPage'
import { AssignActivity } from '@/features/trainer/pages/AssignActivity'
import { TrainerAssignmentsPage } from '@/features/trainer/pages/TrainerAssignmentsPage'

// Analytics feature
import { AnalyticsPage } from '@/features/analytics/pages/AnalyticsPage'

// Admin feature
import { AdminDashboard } from '@/features/admin/pages/AdminDashboard'
import { PendingApproval } from '@/features/admin/pages/PendingApproval'

// Settings feature
import { ProfileSettings } from '@/features/settings/pages/ProfileSettings'

const queryClient = new QueryClient()

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
              <Route path="/onboarding" element={<Onboarding />} />
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
