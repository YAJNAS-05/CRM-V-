import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useNotification } from '../../hooks/useNotification'
import { authApi } from '../../api/authApi'
import { OAUTH_PROVIDERS } from '../../lib/supabaseClient'
import { toast } from 'sonner'
import { Mail, Code, Users, Trash2, Plus } from 'lucide-react'

/**
 * User Profile Page
 * Displays and allows editing of user profile information
 */
const UserProfilePage: React.FC = () => {
  const { user, accessToken, logout } = useAuthStore()
  const { settings, updateSettings } = useSettingsStore()
  const notification = useNotification()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [connectedProviders, setConnectedProviders] = useState<string[]>([])
  const [isLoadingProviders, setIsLoadingProviders] = useState(false)
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null)
  const [editedProfile, setEditedProfile] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
  })
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  // OAuth provider icons mapping
  const providerIcons: Record<string, any> = {
    [OAUTH_PROVIDERS.GOOGLE]: Mail,
    [OAUTH_PROVIDERS.GITHUB]: Code,
    [OAUTH_PROVIDERS.DISCORD]: Users,
  }

  const providerLabels: Record<string, string> = {
    [OAUTH_PROVIDERS.GOOGLE]: 'Google',
    [OAUTH_PROVIDERS.GITHUB]: 'GitHub',
    [OAUTH_PROVIDERS.DISCORD]: 'Discord',
  }

  useEffect(() => {
    loadConnectedProviders()
  }, [])

  const loadConnectedProviders = async () => {
    setIsLoadingProviders(true)
    try {
      const providers = await authApi.getConnectedProviders()
      setConnectedProviders(providers)
    } catch (error) {
      console.error('Error loading connected providers:', error)
    } finally {
      setIsLoadingProviders(false)
    }
  }

  const handleLinkProvider = async (provider: string) => {
    setLinkingProvider(provider)
    try {
      await authApi.linkOAuthProvider(provider as any)
      toast.success(`${providerLabels[provider]} linked successfully`)
      await loadConnectedProviders()
    } catch (error: any) {
      toast.error(error.message || `Failed to link ${providerLabels[provider]}`)
    } finally {
      setLinkingProvider(null)
    }
  }

  const handleUnlinkProvider = async (provider: string) => {
    if (!window.confirm(`Remove ${providerLabels[provider]} from your account?`)) return

    try {
      await authApi.unlinkOAuthProvider(provider as any)
      toast.success(`${providerLabels[provider]} removed successfully`)
      await loadConnectedProviders()
    } catch (error: any) {
      toast.error(error.message || `Failed to remove ${providerLabels[provider]}`)
    }
  }

  const handleProfileChange = (field: string, value: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveProfile = () => {
    if (!editedProfile.fullName.trim()) {
      toast.error('Full name is required')
      return
    }
    notification.success('Profile Updated', 'Your profile has been updated successfully')
    setIsEditingProfile(false)
  }

  const handleChangePassword = () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }
    notification.success('Password Changed', 'Your password has been changed successfully')
    setNewPassword('')
    setConfirmPassword('')
    setShowPasswordForm(false)
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout()
      toast.success('Logged out successfully')
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    )
  }

  const displayRoles = user.roles && user.roles.length > 0 ? user.roles : [user.role]

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar - Avatar & Basic Info */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              {editedProfile.avatarUrl ? (
                <img
                  src={editedProfile.avatarUrl}
                  alt={editedProfile.fullName}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {editedProfile.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h2 className="text-xl font-bold mb-2">{editedProfile.fullName}</h2>
              <p className="text-gray-600 mb-1">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center gap-1">
                {displayRoles.map((roleName) => (
                  <span key={roleName} className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                    {roleName.replace('_', ' ')}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                {user.officeLocation} Office
              </p>
              <p className="text-sm text-gray-500">
                Member since {new Date(user.lastLogin || Date.now()).getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Information Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Profile Information</h3>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {isEditingProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editedProfile.fullName}
                  onChange={(e) => handleProfileChange('fullName', e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editedProfile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={editedProfile.avatarUrl}
                  onChange={(e) => handleProfileChange('avatarUrl', e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {isEditingProfile && (
                <button
                  onClick={handleSaveProfile}
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>

          {/* Password Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Security</h3>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordForm && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Update Password
                </button>
              </div>
            )}
          </div>

          {/* OAuth Providers Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Connected Accounts</h3>
            <p className="text-sm text-gray-600 mb-4">
              Link your social accounts for easier sign-in and enhanced security.
            </p>

            <div className="space-y-3">
              {Object.entries(OAUTH_PROVIDERS).map(([key, provider]) => {
                const Icon = providerIcons[provider]
                const isConnected = connectedProviders.includes(provider)

                return (
                  <div
                    key={provider}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon size={20} className="text-gray-600" />}
                      <div>
                        <p className="font-medium">{providerLabels[provider] || key}</p>
                        <p className="text-sm text-gray-500">
                          {isConnected ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>

                    {isConnected ? (
                      <button
                        onClick={() => handleUnlinkProvider(provider)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLinkProvider(provider)}
                        disabled={linkingProvider === provider}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                      >
                        <Plus size={16} />
                        {linkingProvider === provider ? 'Linking...' : 'Link'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) =>
                    updateSettings({ theme: e.target.value as 'light' | 'dark' })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    updateSettings({ language: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.inAppNotifications}
                    onChange={(e) =>
                      updateSettings({ inAppNotifications: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    In-App Notifications
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      updateSettings({ emailNotifications: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Email Notifications
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items Per Page
                </label>
                <select
                  value={settings.itemsPerPage}
                  onChange={(e) =>
                    updateSettings({ itemsPerPage: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage
