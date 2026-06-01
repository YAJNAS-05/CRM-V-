import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

/**
 * OAuth Callback Handler
 * Local builds do not support OAuth redirects, so we route users back to login.
 */
const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    toast.info('OAuth sign-in is disabled in local mode. Redirecting to login.')
    const timeoutId = window.setTimeout(() => {
      navigate('/login', { replace: true })
      setIsProcessing(false)
    }, 1200)

    return () => window.clearTimeout(timeoutId)
  }, [navigate])

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
