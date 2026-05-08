import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Shield, Home, ArrowLeft, User } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, primaryRole, dashboardPath } = usePermissions()

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleGoHome = () => {
    navigate(dashboardPath || '/dashboard')
  }

  const handleGoToProfile = () => {
    navigate('/profile')
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  You are logged in as <strong>{user.fullName}</strong> 
                  {primaryRole && <span> with role <strong>{primaryRole}</strong></span>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">What can you do?</p>
              <ul className="space-y-1 text-xs">
                <li>• Contact your administrator to request access</li>
                <li>• Check if you're using the correct account</li>
                <li>• Navigate to pages you have permission to access</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button 
                onClick={handleGoHome} 
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleGoBack} 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>

              <Button 
                variant="ghost" 
                onClick={handleGoToProfile} 
                className="w-full"
              >
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              If you believe this is an error, please contact your system administrator
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UnauthorizedPage
