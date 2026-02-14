import { LoginForm } from '@/features/auth/components/LoginForm'
import { AuthLayout } from '@/shared/components/layout/AuthLayout'

export function Login() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to access your dashboard">
      <LoginForm />
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-400">
          Don't have an account?{' '}
          <a
            href="/signup"
            className="text-primary hover:text-green-400 font-semibold transition-colors"
          >
            Create account
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}
