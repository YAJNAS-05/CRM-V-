import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '../../api/authApi'
import { OAUTH_PROVIDERS } from '../../lib/supabaseClient'
import { toast } from 'sonner'
import { Mail, Code, Users } from 'lucide-react'

const signupSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

const oauthProviders = [
  { id: OAUTH_PROVIDERS.GOOGLE, label: 'Google', icon: Mail },
  { id: OAUTH_PROVIDERS.GITHUB, label: 'GitHub', icon: Code },
  { id: OAUTH_PROVIDERS.DISCORD, label: 'Discord', icon: Users },
]

const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOAuthLoading] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      const user = await authApi.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone || '',
      })

      if (!user) {
        toast.error('Signup failed')
        return
      }

      toast.success('Account created successfully! Please login.')
      navigate('/auth/login')
    } catch (error: any) {
      toast.error(error.message || 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: string) => {
    setOAuthLoading(provider)
    try {
      await authApi.signInWithOAuth(provider as any)
    } catch (error: any) {
      toast.error(error.message || 'OAuth signup is unavailable in local auth mode')
    } finally {
      setOAuthLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.12)]">
        <section className="relative hidden w-1/2 overflow-hidden bg-[#0d2a79] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-20 -top-16 h-60 w-60 rounded-full bg-blue-400/20" />
          <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-cyan-300/10" />

          <div className="relative z-10">
            <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.08em]">
              ENTERPRISE CRM + ERP
            </p>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight">Join EVERX Workspace</h1>
            <p className="mt-4 max-w-md text-sm text-blue-100/90">
              Create your account and start managing sales, service, finance, and field operations.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-blue-100">Unified platform</p>
              <p className="mt-1 text-sm font-semibold">CRM, ERP, HR, and field management combined.</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-blue-100">Enterprise security</p>
              <p className="mt-1 text-sm font-semibold">Role-based access and data encryption included.</p>
            </div>
          </div>
        </section>

        <section className="flex w-full flex-col justify-center bg-white px-6 py-8 sm:px-10 lg:w-1/2 lg:px-12">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Create Account</h2>
            <p className="mt-2 text-sm text-slate-500">Sign up with OAuth or email to get started.</p>
          </div>

          {/* OAuth Providers */}
          <div className="mb-6 space-y-2">
            {oauthProviders.map((provider) => {
              const Icon = provider.icon
              return (
                <button
                  key={provider.id}
                  onClick={() => handleOAuthSignUp(provider.id)}
                  disabled={oauthLoading !== null}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon size={18} />
                  Sign up with {provider.label}
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Organization Name
              </label>
              <input
                type="text"
                {...register('organizationName')}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Acme Corporation"
              />
              {errors.organizationName && (
                <p className="mt-1.5 text-sm text-red-500">{errors.organizationName.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                {...register('fullName')}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="mt-1.5 text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Work Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="john@company.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Phone (Optional)
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                type="password"
                {...register('password')}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="At least 8 characters"
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>
              <input
                type="password"
                {...register('confirmPassword')}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || oauthLoading !== null}
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SignupPage
