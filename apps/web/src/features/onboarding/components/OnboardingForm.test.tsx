import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OnboardingForm } from './OnboardingForm'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock auth service
const mockCompleteOnboarding = vi.fn()
const mockCreateGoogleUserProfile = vi.fn()
vi.mock('@/features/auth/services/auth.service', () => ({
  completeOnboarding: (...args: unknown[]) => mockCompleteOnboarding(...args),
  createGoogleUserProfile: (...args: unknown[]) => mockCreateGoogleUserProfile(...args),
}))

// Mock AuthProvider
const mockUseAuth = vi.fn()
vi.mock('@/features/auth/providers/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('OnboardingForm', () => {
  const mockRefreshProfile = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockRefreshProfile.mockResolvedValue(undefined)
    mockCompleteOnboarding.mockResolvedValue(undefined)
    mockCreateGoogleUserProfile.mockResolvedValue(undefined)
  })

  describe('for email signup users (hiker)', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: '123', email: 'hiker@example.com', displayName: 'Alex' },
        profile: { uid: '123', email: 'hiker@example.com', role: 'hiker', displayName: 'Alex' },
        refreshProfile: mockRefreshProfile,
      })
    })

    it('renders common fields (name, age, weight, height)', () => {
      render(<OnboardingForm />)
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Age')).toBeInTheDocument()
      expect(screen.getByLabelText('Weight (kg)')).toBeInTheDocument()
      expect(screen.getByLabelText('Height (cm)')).toBeInTheDocument()
    })

    it('does not show role selector for users with existing role', () => {
      render(<OnboardingForm />)
      expect(screen.queryByText('I am a:')).not.toBeInTheDocument()
    })

    it('shows experience level field for hiker', () => {
      render(<OnboardingForm />)
      expect(screen.getByLabelText('Experience Level')).toBeInTheDocument()
    })

    it('shows fitness goal field for hiker', () => {
      render(<OnboardingForm />)
      expect(screen.getByText(/Fitness Goal/)).toBeInTheDocument()
    })

    it('does not show trainer credential fields', () => {
      render(<OnboardingForm />)
      expect(screen.queryByText('Certifications & Credentials')).not.toBeInTheDocument()
      expect(screen.queryByText('Area of Specialization')).not.toBeInTheDocument()
    })

    it('pre-fills display name from profile', () => {
      render(<OnboardingForm />)
      const nameInput = screen.getByLabelText('Full Name') as HTMLInputElement
      expect(nameInput.value).toBe('Alex')
    })

    it('submits onboarding data and navigates to home', async () => {
      render(<OnboardingForm />)

      fireEvent.change(screen.getByLabelText('Age'), { target: { value: '25' } })
      fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '75' } })
      fireEvent.change(screen.getByLabelText('Height (cm)'), { target: { value: '180' } })
      fireEvent.change(screen.getByLabelText('Experience Level'), {
        target: { value: 'intermediate' },
      })

      fireEvent.click(screen.getByRole('button', { name: /Complete Setup/i }))

      await waitFor(() => {
        expect(mockCompleteOnboarding).toHaveBeenCalledWith('123', expect.objectContaining({
          displayName: 'Alex',
          age: 25,
          weight: 75,
          height: 180,
          experienceLevel: 'intermediate',
        }))
      })

      await waitFor(() => {
        expect(mockRefreshProfile).toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('for email signup users (trainee)', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: '456', email: 'trainee@example.com', displayName: 'Sam' },
        profile: { uid: '456', email: 'trainee@example.com', role: 'trainee', displayName: 'Sam' },
        refreshProfile: mockRefreshProfile,
      })
    })

    it('shows experience level and fitness goal for trainee', () => {
      render(<OnboardingForm />)
      expect(screen.getByLabelText('Experience Level')).toBeInTheDocument()
      expect(screen.getByText(/Fitness Goal/)).toBeInTheDocument()
    })

    it('does not show trainer fields', () => {
      render(<OnboardingForm />)
      expect(screen.queryByText('Certifications & Credentials')).not.toBeInTheDocument()
    })
  })

  describe('for email signup users (trainer)', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: '789', email: 'trainer@example.com', displayName: 'Coach' },
        profile: {
          uid: '789',
          email: 'trainer@example.com',
          role: 'trainer',
          isApproved: false,
          displayName: 'Coach',
        },
        refreshProfile: mockRefreshProfile,
      })
    })

    it('shows trainer credential fields', () => {
      render(<OnboardingForm />)
      expect(screen.getByLabelText('Certifications & Credentials')).toBeInTheDocument()
      expect(screen.getByLabelText('Area of Specialization')).toBeInTheDocument()
    })

    it('does not show trainee fields', () => {
      render(<OnboardingForm />)
      expect(screen.queryByLabelText('Experience Level')).not.toBeInTheDocument()
      expect(screen.queryByText(/Fitness Goal/)).not.toBeInTheDocument()
    })

    it('shows admin review note for trainers', () => {
      render(<OnboardingForm />)
      expect(screen.getByText(/credentials will be reviewed/i)).toBeInTheDocument()
    })

    it('submits trainer onboarding data', async () => {
      render(<OnboardingForm />)

      fireEvent.change(screen.getByLabelText('Age'), { target: { value: '35' } })
      fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '80' } })
      fireEvent.change(screen.getByLabelText('Height (cm)'), { target: { value: '175' } })
      fireEvent.change(screen.getByLabelText('Certifications & Credentials'), {
        target: { value: 'NASM CPT, ACE Certified' },
      })
      fireEvent.change(screen.getByLabelText('Area of Specialization'), {
        target: { value: 'strength_training' },
      })

      fireEvent.click(screen.getByRole('button', { name: /Complete Setup/i }))

      await waitFor(() => {
        expect(mockCompleteOnboarding).toHaveBeenCalledWith('789', expect.objectContaining({
          displayName: 'Coach',
          age: 35,
          weight: 80,
          height: 175,
          certifications: 'NASM CPT, ACE Certified',
          specialization: 'strength_training',
        }))
      })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('for Google auth users (no profile)', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: 'g-123', email: 'google@example.com', displayName: 'Google User' },
        profile: null,
        refreshProfile: mockRefreshProfile,
      })
    })

    it('shows role selector when profile has no role', () => {
      render(<OnboardingForm />)
      expect(screen.getByText('I am a:')).toBeInTheDocument()
      expect(screen.getByText('Trainee')).toBeInTheDocument()
      expect(screen.getByText('Hiker')).toBeInTheDocument()
      expect(screen.getByText('Trainer')).toBeInTheDocument()
    })

    it('pre-fills display name from Firebase auth user', () => {
      render(<OnboardingForm />)
      const nameInput = screen.getByLabelText('Full Name') as HTMLInputElement
      expect(nameInput.value).toBe('Google User')
    })

    it('creates Google profile before completing onboarding', async () => {
      render(<OnboardingForm />)

      // Select role
      fireEvent.click(screen.getByText('Hiker'))

      // Fill fields
      fireEvent.change(screen.getByLabelText('Age'), { target: { value: '28' } })
      fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '70' } })
      fireEvent.change(screen.getByLabelText('Height (cm)'), { target: { value: '170' } })
      fireEvent.change(screen.getByLabelText('Experience Level'), {
        target: { value: 'beginner' },
      })

      fireEvent.click(screen.getByRole('button', { name: /Complete Setup/i }))

      await waitFor(() => {
        expect(mockCreateGoogleUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({ uid: 'g-123' }),
          'hiker'
        )
      })

      await waitFor(() => {
        expect(mockCompleteOnboarding).toHaveBeenCalledWith('g-123', expect.objectContaining({
          age: 28,
          weight: 70,
          height: 170,
          experienceLevel: 'beginner',
        }))
      })
    })

    it('does not call createGoogleUserProfile for email signup users', async () => {
      mockUseAuth.mockReturnValue({
        user: { uid: '123', email: 'hiker@example.com', displayName: 'Alex' },
        profile: { uid: '123', email: 'hiker@example.com', role: 'hiker', displayName: 'Alex' },
        refreshProfile: mockRefreshProfile,
      })

      render(<OnboardingForm />)

      fireEvent.change(screen.getByLabelText('Age'), { target: { value: '25' } })
      fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '75' } })
      fireEvent.change(screen.getByLabelText('Height (cm)'), { target: { value: '180' } })
      fireEvent.change(screen.getByLabelText('Experience Level'), {
        target: { value: 'intermediate' },
      })

      fireEvent.click(screen.getByRole('button', { name: /Complete Setup/i }))

      await waitFor(() => {
        expect(mockCreateGoogleUserProfile).not.toHaveBeenCalled()
        expect(mockCompleteOnboarding).toHaveBeenCalled()
      })
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: '123', email: 'test@example.com', displayName: 'Test' },
        profile: { uid: '123', email: 'test@example.com', role: 'hiker', displayName: 'Test' },
        refreshProfile: mockRefreshProfile,
      })
    })

    it('displays error when onboarding fails', async () => {
      mockCompleteOnboarding.mockRejectedValue(new Error('Network error'))

      render(<OnboardingForm />)

      fireEvent.change(screen.getByLabelText('Age'), { target: { value: '25' } })
      fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '75' } })
      fireEvent.change(screen.getByLabelText('Height (cm)'), { target: { value: '180' } })
      fireEvent.change(screen.getByLabelText('Experience Level'), {
        target: { value: 'beginner' },
      })

      fireEvent.click(screen.getByRole('button', { name: /Complete Setup/i }))

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})
