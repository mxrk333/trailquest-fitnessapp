import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './providers/AuthProvider'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { PublicRoute } from './components/layout/PublicRoute'
import { LoginForm } from './components/auth/LoginForm'
import { SignUpForm } from './components/auth/SignUpForm'
import { Onboarding } from './pages/onboarding/Onboarding'
import { testFirestoreConnection } from './services/firestore/test.service'
import { useEffect, useState } from 'react'

import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@repo/ui'

function Home() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    const checkConnection = async () => {
      setStatus('loading')
      const result = await testFirestoreConnection()
      setStatus(result ? 'success' : 'error')
    }
    checkConnection()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button onClick={handleLogout} variant="destructive">
          Sign Out
        </Button>
      </div>

      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent animate-pulse">
          TrailQuest
        </h1>

        <div
          className={`p-6 rounded-2xl border transition-all duration-500 ${
            status === 'loading'
              ? 'border-blue-500/30 bg-blue-500/10'
              : status === 'success'
                ? 'border-green-500/30 bg-green-500/10'
                : status === 'error'
                  ? 'border-red-500/30 bg-red-500/10'
                  : 'border-gray-800'
          }`}
        >
          {status === 'loading' && (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-blue-400 font-medium">Connecting to Firestore...</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 font-medium">System Online</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-400 font-medium">Connection Failed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AuthPage({ type }: { type: 'login' | 'signup' }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-900 rounded-2xl border border-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            {type === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {type === 'login' ? 'Sign in to access your dashboard' : 'Join TrailQuest today'}
          </p>
        </div>

        {type === 'login' ? <LoginForm /> : <SignUpForm />}

        <div className="text-center">
          <a
            href={type === 'login' ? '/signup' : '/login'}
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            {type === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </a>
        </div>
      </div>
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - Only accessible if NOT logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<AuthPage type="login" />} />
            <Route path="/signup" element={<AuthPage type="signup" />} />
          </Route>

          {/* Protected Routes - Only accessible if logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
