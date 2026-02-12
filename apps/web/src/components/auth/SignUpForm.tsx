import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { signUpWithEmail, signInWithGoogle } from '@/services/firestore/auth/auth.service'
import { useNavigate } from 'react-router-dom'

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['trainee', 'hiker', 'trainer']),
  age: z.coerce.number().min(1, 'Age must be valid').optional(),
  weight: z.coerce.number().min(1, 'Weight must be valid').optional(),
  height: z.coerce.number().min(1, 'Height must be valid').optional(),
  terms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
})

type SignUpFormValues = z.infer<typeof signUpSchema>

export function SignUpForm() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: 'hiker',
      terms: false,
    },
  })

  const onSubmit = async (data: SignUpFormValues) => {
    setLoading(true)
    setError(null)
    try {
      await signUpWithEmail(
        data.email,
        data.password,
        data.name,
        data.role,
        data.age,
        data.weight,
        data.height
      )
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
      {/* Role Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1 mb-3">
          I am a:
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="cursor-pointer group">
            <input type="radio" value="trainee" {...register('role')} className="peer sr-only" />
            <div className="flex flex-col items-center justify-center p-3 border border-white/10 rounded-xl bg-input-bg hover:bg-white/5 transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:shadow-glow peer-checked:shadow-primary/20">
              <span className="material-icons text-gray-500 group-hover:text-primary peer-checked:text-primary mb-1">
                fitness_center
              </span>
              <span className="text-xs font-semibold text-gray-400 peer-checked:text-white">
                Trainee
              </span>
            </div>
          </label>
          <label className="cursor-pointer group">
            <input type="radio" value="hiker" {...register('role')} className="peer sr-only" />
            <div className="flex flex-col items-center justify-center p-3 border border-white/10 rounded-xl bg-input-bg hover:bg-white/5 transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:shadow-glow peer-checked:shadow-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-bl-lg opacity-0 peer-checked:opacity-100 transition-opacity"></div>
              <span className="material-icons text-gray-500 group-hover:text-primary peer-checked:text-primary mb-1">
                hiking
              </span>
              <span className="text-xs font-semibold text-gray-400 peer-checked:text-white">
                Hiker
              </span>
            </div>
          </label>
          <label className="cursor-pointer group">
            <input type="radio" value="trainer" {...register('role')} className="peer sr-only" />
            <div className="flex flex-col items-center justify-center p-3 border border-white/10 rounded-xl bg-input-bg hover:bg-white/5 transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:shadow-glow peer-checked:shadow-primary/20">
              <span className="material-icons text-gray-500 group-hover:text-primary peer-checked:text-primary mb-1">
                timer
              </span>
              <span className="text-xs font-semibold text-gray-400 peer-checked:text-white">
                Trainer
              </span>
            </div>
          </label>
        </div>
        {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>}
      </div>

      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1"
            htmlFor="name"
          >
            Full Name
          </label>
          <div className="relative group mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-gray-500 group-focus-within:text-primary transition-colors text-xl">
                person
              </span>
            </div>
            <input
              id="name"
              type="text"
              placeholder="Alex Venture"
              disabled={loading}
              className="block w-full pl-10 pr-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm"
              {...register('name')}
            />
          </div>
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1"
            htmlFor="email"
          >
            Email Address
          </label>
          <div className="relative group mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-gray-500 group-focus-within:text-primary transition-colors text-xl">
                email
              </span>
            </div>
            <input
              id="email"
              type="email"
              placeholder="alex@trailquest.com"
              disabled={loading}
              className="block w-full pl-10 pr-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm"
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative group mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-gray-500 group-focus-within:text-primary transition-colors text-xl">
                lock
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
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
              <span className="material-icons text-gray-500 hover:text-white transition-colors text-xl">
                visibility
              </span>
            </div>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Physical Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Age */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1"
              htmlFor="age"
            >
              Age
            </label>
            <input
              id="age"
              type="number"
              placeholder="25"
              disabled={loading}
              className="mt-1 block w-full px-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm"
              {...register('age')}
            />
          </div>

          {/* Weight */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1"
              htmlFor="weight"
            >
              Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              placeholder="75"
              disabled={loading}
              className="mt-1 block w-full px-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm"
              {...register('weight')}
            />
          </div>

          {/* Height */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1"
              htmlFor="height"
            >
              Height (cm)
            </label>
            <input
              id="height"
              type="number"
              placeholder="180"
              disabled={loading}
              className="mt-1 block w-full px-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm"
              {...register('height')}
            />
          </div>
        </div>
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 text-primary focus:ring-primary border-white/10 rounded bg-surface-dark/50"
            {...register('terms')}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="terms" className="font-medium text-gray-400">
            I agree to the{' '}
            <a
              href="#"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="#"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Privacy Policy
            </a>
          </label>
          {errors.terms && <p className="text-sm text-red-500 mt-1">{errors.terms.message}</p>}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded text-center">{error}</p>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/20 text-sm font-bold text-background-dark bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background-dark transition-all transform active:scale-[0.98] duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="mr-2 h-4 w-4 animate-spin border-2 border-background-dark border-t-transparent rounded-full" />
          ) : (
            'Create Account'
          )}
        </button>
      </div>

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
      <div>
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
      </div>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{' '}
        <a
          href="/login"
          className="font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center group"
        >
          Sign In
          <span className="material-icons text-base ml-0.5 transform group-hover:translate-x-1 transition-transform">
            chevron_right
          </span>
        </a>
      </p>
    </form>
  )
}
