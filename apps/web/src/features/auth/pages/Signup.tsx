import { SignUpForm } from '@/features/auth/components/SignUpForm'
import { AuthLayout } from '@/shared/components/layout/AuthLayout'

export function Signup() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join our community of fitness enthusiasts today"
    >
      <SignUpForm />
    </AuthLayout>
  )
}
