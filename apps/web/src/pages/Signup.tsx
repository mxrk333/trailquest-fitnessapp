import { SignUpForm } from '@/components/auth/SignUpForm'
import { AuthLayout } from '@/components/layout/AuthLayout'

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
