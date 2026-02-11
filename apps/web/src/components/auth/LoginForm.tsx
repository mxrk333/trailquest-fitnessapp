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
            className="block w-full pl-10 pr-3 py-3 bg-input-bg border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm"
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
            className="block w-full pl-10 pr-3 py-3 bg-input-bg border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm"
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
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all duration-200 group"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5 text-white group-hover:scale-110 transition-transform"
          viewBox="0 0 24 24"
        >
          <path
            d="M12.0003 20.45c4.6667 0 8.45-3.7833 8.45-8.45 0-.4167-.0334-.8167-.1-1.2167H12.0003v3.2h4.8167c-.2084 1.125-1.05 2.5833-2.9 3.825l-.0276.1824 2.6508 2.0538.1837.0184c2.6833-2.4667 4.225-6.1 4.225-10.2917 0-.7083-.0666-1.4-.1916-2.075H4.9586v3.2h9.2417c-.1667.925-.525 1.775-1.025 2.5166l-2.7333 2.1584c-1.35.8333-3.0667 1.325-4.9417 1.325-4.6666 0-8.45-3.7833-8.45-8.45 0-2.6508 1.225-5.0333 3.15-6.6l-.1677-.2459-2.7475-2.1226-.2016.095c-2.4583 2.175-4.0333 5.3-4.0333 8.875 0 6.6667 5.4 12 12 12z"
            fill="currentColor"
            fillOpacity="1"
          ></path>
        </svg>
        <span className="text-sm font-medium">Google</span>
      </button>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded text-center">{error}</p>
      )}

      {/* Footer Sign Up Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">
          New to TrailQuest?{' '}
          <a
            className="font-bold text-primary hover:text-primary/80 transition-colors ml-1 inline-flex items-center group"
            href="/sign-up"
          >
            Create an Account
            <span className="material-icons text-base ml-0.5 transform group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </a>
        </p>
      </div>
    </form>
  )
}
