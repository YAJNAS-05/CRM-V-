import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/authApi'
import { toast } from 'sonner'

/**
 * OAuth Callback Handler
 * Processes OAuth redirects from Supabase
 */
const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from Supabase
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !sessionData.session) {
          throw new Error(sessionError?.message || 'Failed to establish session')
        }

        const session = sessionData.session
        const user = session.user
        let resolvedUser = null

        try {
          resolvedUser = await authApi.me()
        } catch {
          resolvedUser = null
        }

        // Extract user information
        const userData = resolvedUser || {
          id: user.id,
          email: user.email || '',
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatarUrl: user.user_metadata?.avatar_url || '',
          phone: user.user_metadata?.phone || '',
          role: user.user_metadata?.role || 'EMPLOYEE',
          roles: [user.user_metadata?.role || 'EMPLOYEE'],
          permissions: [],
          officeLocation: 'Global',
          isActive: true,
          lastLogin: new Date().toISOString(),
        }

        // Store auth data (you may need to call your backend to create/update the user)
        login(userData, session.access_token, session.refresh_token || '')

        toast.success('Logged in successfully!')
        navigate('/dashboard')
      } catch (error: any) {
        console.error('OAuth callback error:', error)
        toast.error(error.message || 'Authentication failed. Please try again.')
        setTimeout(() => navigate('/auth/login'), 2000)
      } finally {
        setIsProcessing(false)
      }
    }

    handleCallback()
  }, [navigate, login])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
        <p className="text-lg font-medium text-gray-900">
          {isProcessing ? 'Processing your sign-in...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  )
}

export default OAuthCallbackPage
