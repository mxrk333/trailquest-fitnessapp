import { OnboardingForm } from '@/features/onboarding/components/OnboardingForm'
import { AuthLayout } from '@/shared/components/layout/AuthLayout'

export function Onboarding() {
  return (
    <AuthLayout
      title="Complete Your Profile"
      subtitle="Tell us a bit about yourself to personalize your experience"
    >
      <OnboardingForm />
    </AuthLayout>
  )
}
