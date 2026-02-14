import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'

// Mock the AuthProvider
const mockUseAuth = vi.fn()
vi.mock('@/features/auth/providers/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<div>Onboarding Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/" element={<div>Home</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state while auth is initializing', () => {
    mockUseAuth.mockReturnValue({ user: null, profile: null, loading: true })
    renderWithRouter('/dashboard')
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('redirects to /login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, profile: null, loading: false })
    renderWithRouter('/dashboard')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('redirects to /onboarding when user has no profile (Google auth)', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      profile: null,
      loading: false,
    })
    renderWithRouter('/dashboard')
    expect(screen.getByText('Onboarding Page')).toBeInTheDocument()
  })

  it('redirects to /onboarding when onboardingCompleted is false', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      profile: { uid: '123', email: 'test@example.com', role: 'hiker', onboardingCompleted: false },
      loading: false,
    })
    renderWithRouter('/dashboard')
    expect(screen.getByText('Onboarding Page')).toBeInTheDocument()
  })

  it('allows access when onboardingCompleted is true', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      profile: { uid: '123', email: 'test@example.com', role: 'hiker', onboardingCompleted: true },
      loading: false,
    })
    renderWithRouter('/dashboard')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('grandfathers existing users who have age set', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      profile: { uid: '123', email: 'test@example.com', role: 'trainee', age: 25 },
      loading: false,
    })
    renderWithRouter('/dashboard')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('allows the /onboarding route itself through without redirect loop', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      profile: null,
      loading: false,
    })
    renderWithRouter('/onboarding')
    expect(screen.getByText('Onboarding Page')).toBeInTheDocument()
  })

  it('redirects trainer without onboarding to /onboarding', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: '123', email: 'trainer@example.com' },
      profile: {
        uid: '123',
        email: 'trainer@example.com',
        role: 'trainer',
        isApproved: false,
        onboardingCompleted: false,
      },
      loading: false,
    })
    renderWithRouter('/dashboard')
    expect(screen.getByText('Onboarding Page')).toBeInTheDocument()
  })

  it('allows trainer with completed onboarding through', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: '123', email: 'trainer@example.com' },
      profile: {
        uid: '123',
        email: 'trainer@example.com',
        role: 'trainer',
        isApproved: true,
        onboardingCompleted: true,
      },
      loading: false,
    })
    renderWithRouter('/dashboard')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
