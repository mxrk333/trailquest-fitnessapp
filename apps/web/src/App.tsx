import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Login } from './pages/Login'
import { LogActivity } from './pages/LogActivity'
import { AuthProvider } from './providers/AuthProvider'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TrainerDashboard } from './pages/TrainerDashboard'
import { ProfileSettings } from './pages/ProfileSettings'
import { ClientDetailPage } from './pages/ClientDetailPage'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ReadinessCard } from '@/components/dashboard/ReadinessCard'
import { MuscleHeatmap } from '@/components/dashboard/MuscleHeatmap'
import { DashboardFeed } from '@/components/dashboard/DashboardFeed'
import { NutritionWidget } from '@/components/dashboard/NutritionWidget'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { useAuth } from '@/providers/AuthProvider'

const queryClient = new QueryClient()

function Home() {
  const { profile } = useAuth()

  if (profile?.role === 'trainer') {
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Readiness & Heatmap */}
        <div className="space-y-6">
          <ReadinessCard />
          <MuscleHeatmap />
        </div>

        {/* Middle Column - Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardFeed />
        </div>
      </div>

      {/* Bottom Row - Nutrition */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <NutritionWidget />
      </div>
    </div>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
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
              <Route path="/log-activity" element={<LogActivity />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/trainer" element={<TrainerDashboard />} />
              <Route path="/trainer/client/:clientId" element={<ClientDetailPage />} />
              <Route path="/settings" element={<ProfileSettings />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
