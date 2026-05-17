import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    try {
      toast.info('Self-service reset is disabled in local auth mode. Ask admin to reset your password.')
      setTimeout(() => {
        navigate('/auth/login')
      }, 1500)
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password')
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
            <h1 className="mt-6 text-4xl font-extrabold leading-tight">Create New Password</h1>
            <p className="mt-4 max-w-md text-sm text-blue-100/90">
              Enter a strong password to secure your account. Make sure to use a mix of uppercase, lowercase, numbers, and special characters.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-blue-100">Strong Password</p>
              <p className="mt-1 text-sm font-semibold">At least 8 characters with mixed case and numbers.</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-blue-100">Account Security</p>
              <p className="mt-1 text-sm font-semibold">Your new password is encrypted and never shared.</p>
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
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Reset password</h2>
            <p className="mt-2 text-sm text-slate-500">Create a new strong password for your account.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
              )}
              <p className="mt-2 text-xs text-slate-500">
                Must contain: uppercase, lowercase, number, and be at least 8 characters
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default ResetPasswordPage
