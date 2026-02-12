import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { signInWithEmail, signInWithGoogle } from '@/services/firestore/auth/auth.service'
import { useNavigate } from 'react-router-dom'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true)
    setError(null)
    try {
      await signInWithEmail(data.email, data.password)
      navigate('/')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <label
          className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1"
          htmlFor="email"
        >
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-icons text-gray-500 group-focus-within:text-primary transition-colors text-xl">
              mail_outline
            </span>
          </div>
          <input
            id="email"
            type="email"
            placeholder="hiker@trailquest.com"
            disabled={loading}
            className="block w-full pl-10 pr-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm"
            {...register('email')}
          />
        </div>
        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-gray-400"
            htmlFor="password"
          >
            Password
          </label>
          <a
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            href="#"
          >
            Forgot Password?
          </a>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-icons text-gray-500 group-focus-within:text-primary transition-colors text-xl">
              lock_outline
            </span>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={loading}
            className="block w-full pl-10 pr-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm"
            {...register('password')}
          />
        </div>
        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/20 text-sm font-bold text-background-dark bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background-dark transition-all transform active:scale-[0.98] duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="mr-2 h-4 w-4 animate-spin border-2 border-background-dark border-t-transparent rounded-full" />
        ) : (
          <>
            Sign In
            <span className="material-icons text-lg ml-2">arrow_forward</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-card-dark text-gray-500 text-xs uppercase tracking-widest font-semibold">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login */}
      <button
        type="button"
        onClick={async () => {
          setLoading(true)
          setError(null)
          try {
            await signInWithGoogle()
            navigate('/')
          } catch (err: unknown) {
            if (err instanceof Error) {
              setError(err.message)
            }
          } finally {
            setLoading(false)
          }
        }}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-white/10 rounded-xl bg-white text-gray-900 hover:bg-white/90 transition-all duration-200 group"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span className="text-sm font-medium">Continue with Google</span>
      </button>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded text-center">{error}</p>
      )}

      {/* Footer Sign Up Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400"></p>
      </div>
    </form>
  )
}
