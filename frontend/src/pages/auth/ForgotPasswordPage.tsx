import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        toast.error(error.message || 'Failed to send reset email')
        return
      }

      toast.success('Password reset email sent! Check your inbox.')
      setTimeout(() => {
        navigate('/auth/login')
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to process password reset')
    } finally {
      setIsLoading(false)
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
            <h1 className="mt-6 text-4xl font-extrabold leading-tight">Reset Your Password</h1>
            <p className="mt-4 max-w-md text-sm text-blue-100/90">
              We'll send you a link to reset your password. Follow the link in your email to create a new password.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-blue-100">Security First</p>
              <p className="mt-1 text-sm font-semibold">Your password reset link will expire in 24 hours.</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-blue-100">No Spam</p>
              <p className="mt-1 text-sm font-semibold">We only send password reset emails when requested.</p>
            </div>
          </div>
        </section>

        <section className="flex w-full flex-col justify-center bg-white px-6 py-8 sm:px-10 lg:w-1/2 lg:px-12">
          <button
            onClick={() => navigate('/auth/login')}
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={18} />
            Back to sign in
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Forgot password?</h2>
            <p className="mt-2 text-sm text-slate-500">Enter your email and we'll send you a link to reset your password.</p>
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

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Remember your password?{' '}
            <Link to="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
