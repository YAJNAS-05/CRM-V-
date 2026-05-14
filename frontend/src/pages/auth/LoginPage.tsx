import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/authApi'
import { OAUTH_PROVIDERS, supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'
import { Mail, Code, Users } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

const oauthProviders = [
  { id: OAUTH_PROVIDERS.GOOGLE, label: 'Google', icon: Mail },
  { id: OAUTH_PROVIDERS.GITHUB, label: 'GitHub', icon: Code },
  { id: OAUTH_PROVIDERS.DISCORD, label: 'Discord', icon: Users },
]

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOAuthLoading] = useState<string | null>(null)
  const { login } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const session = await authApi.signInWithEmail(data.email, data.password)
      if (!session || !session.user) {
        toast.error('Login failed')
        return
      }

      // Get the current session to extract tokens
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData?.session?.user && sessionData?.session) {
        const supabaseUser = sessionData.session.user
        const supabaseSession = sessionData.session
        let resolvedUser = null

        try {
          resolvedUser = await authApi.me()
        } catch {
          resolvedUser = null
        }

        login(
          resolvedUser || {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            fullName: supabaseUser.user_metadata?.full_name || '',
            phone: supabaseUser.user_metadata?.phone || '',
            role: supabaseUser.user_metadata?.role || 'EMPLOYEE',
            roles: [supabaseUser.user_metadata?.role || 'EMPLOYEE'],
            permissions: [],
            officeLocation: supabaseUser.user_metadata?.officeLocation || 'AUSTRALIA',
            isActive: true,
            lastLogin: new Date().toISOString(),
            avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
          },
          supabaseSession.access_token,
          supabaseSession.refresh_token || ''
        )
        toast.success('Login successful')
        navigate('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setOAuthLoading(provider)
    try {
      await authApi.signInWithOAuth(provider as any)
      toast.success(`Redirecting to ${provider} login...`)
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`)
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
            <h1 className="mt-6 text-4xl font-extrabold leading-tight">Welcome to EVERX Workspace</h1>
            <p className="mt-4 max-w-md text-sm text-blue-100/90">
              A single operational cockpit for sales, service, finance, and field teams.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-blue-100">Realtime control</p>
              <p className="mt-1 text-sm font-semibold">Pipeline, activities, and service in one place.</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-blue-100">Role-based security</p>
              <p className="mt-1 text-sm font-semibold">Permissions enforced consistently across modules.</p>
            </div>
          </div>
        </section>

        <section className="flex w-full flex-col justify-center bg-white px-6 py-8 sm:px-10 lg:w-1/2 lg:px-12">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">Use your enterprise credentials or OAuth provider to continue.</p>
          </div>

          {/* OAuth Providers */}
          <div className="mb-6 space-y-2">
            {oauthProviders.map((provider) => {
              const Icon = provider.icon
              return (
                <button
                  key={provider.id}
                  onClick={() => handleOAuthSignIn(provider.id)}
                  disabled={oauthLoading !== null}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon size={18} />
                  Sign in with {provider.label}
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
              <span className="bg-white px-2 text-slate-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Work Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="admin@everx.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <Link 
                  to="/auth/forgot-password" 
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                {...register('password')}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || oauthLoading !== null}
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign up
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
