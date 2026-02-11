import { LoginForm } from '@/components/auth/LoginForm'
import { AuthLayout } from '@/components/layout/AuthLayout'

export function Login() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to access your dashboard">
      <LoginForm />
    </AuthLayout>
  )
}
