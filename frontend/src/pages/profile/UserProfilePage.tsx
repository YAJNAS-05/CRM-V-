import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useNotification } from '../../hooks/useNotification'
import { OAUTH_PROVIDERS } from '../../lib/localAuth'
import { settingsApi } from '../../api/settingsApi'
import { hasAdminSettingsAccess } from '../../lib/settingsAccess'
import type { UserSettings } from '../../types'
import { toast } from 'sonner'
import { Mail, Code, Users } from 'lucide-react'

/**
 * User Profile Page
 * Displays and allows editing of user profile information
 */
const UserProfilePage: React.FC = () => {
  const { user, accessToken, logout } = useAuthStore()
  const { settings: cachedSettings, replaceSettings } = useSettingsStore()
  const notification = useNotification()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
  })
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false)
  const [isSavingPreferences, setIsSavingPreferences] = useState(false)
  const [isSavingRoleDefaults, setIsSavingRoleDefaults] = useState(false)
  const [personalSettings, setPersonalSettings] = useState<UserSettings>(cachedSettings)
  const [roleSettings, setRoleSettings] = useState<UserSettings>(cachedSettings)

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

  const handleLinkProvider = async (provider: string) => {
    toast.info(`${providerLabels[provider]} linking is disabled in local mode`)
  }

  const handleUnlinkProvider = async (provider: string) => {
    toast.info(`${providerLabels[provider]} unlinking is disabled in local mode`)
  }

  const handleProfileChange = (field: string, value: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const effectiveRoleName = useMemo(() => {
    if (!user) {
      return null
    }

    if (user.role) {
      return user.role
    }

    return user.roles && user.roles.length > 0 ? user.roles[0] : null
  }, [user])

  const canManageRoleDefaults = hasAdminSettingsAccess(user)

  useEffect(() => {
    if (!user) {
      return
    }

    let isMounted = true

    const loadSettings = async () => {
      setIsLoadingPreferences(true)
      try {
        const personalResponse = await settingsApi.getMySettings()
        if (isMounted && personalResponse) {
          const personal = {
            theme: personalResponse.theme,
            language: personalResponse.language,
            timezone: personalResponse.timezone,
            notificationsEnabled: personalResponse.notificationsEnabled,
            emailNotifications: personalResponse.emailNotifications,
            inAppNotifications: personalResponse.inAppNotifications,
            autoRefresh: personalResponse.autoRefresh,
            itemsPerPage: personalResponse.itemsPerPage,
          }
          setPersonalSettings(personal)
          replaceSettings(personal)
        }

        if (isMounted && canManageRoleDefaults && effectiveRoleName) {
          const roleResponse = await settingsApi.getRoleSettings(effectiveRoleName)
          if (roleResponse) {
            setRoleSettings({
              theme: roleResponse.theme,
              language: roleResponse.language,
              timezone: roleResponse.timezone,
              notificationsEnabled: roleResponse.notificationsEnabled,
              emailNotifications: roleResponse.emailNotifications,
              inAppNotifications: roleResponse.inAppNotifications,
              autoRefresh: roleResponse.autoRefresh,
              itemsPerPage: roleResponse.itemsPerPage,
            })
          }
        }
      } catch {
        if (isMounted) {
          setPersonalSettings(cachedSettings)
          setRoleSettings(cachedSettings)
        }
      } finally {
        if (isMounted) {
          setIsLoadingPreferences(false)
        }
      }
    }

    void loadSettings()

    return () => {
      isMounted = false
    }
  }, [cachedSettings, canManageRoleDefaults, effectiveRoleName, replaceSettings, user])

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

  const handlePersonalSettingChange = <K extends keyof UserSettings>(field: K, value: UserSettings[K]) => {
    setPersonalSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleRoleSettingChange = <K extends keyof UserSettings>(field: K, value: UserSettings[K]) => {
    setRoleSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSavePersonalSettings = async () => {
    setIsSavingPreferences(true)
    try {
      const savedSettings = await settingsApi.updateMySettings(personalSettings)
      if (savedSettings) {
        const normalizedSettings = {
          theme: savedSettings.theme,
          language: savedSettings.language,
          timezone: savedSettings.timezone,
          notificationsEnabled: savedSettings.notificationsEnabled,
          emailNotifications: savedSettings.emailNotifications,
          inAppNotifications: savedSettings.inAppNotifications,
          autoRefresh: savedSettings.autoRefresh,
          itemsPerPage: savedSettings.itemsPerPage,
        }

        setPersonalSettings(normalizedSettings)
        replaceSettings(normalizedSettings)
      }

      notification.success('Preferences Updated', 'Your personal preferences were saved successfully')
    } catch {
      toast.error('Unable to save personal preferences')
    } finally {
      setIsSavingPreferences(false)
    }
  }

  const handleSaveRoleDefaults = async () => {
    if (!effectiveRoleName) {
      toast.error('No primary role found for this account')
      return
    }

    setIsSavingRoleDefaults(true)
    try {
      await settingsApi.updateRoleSettings(effectiveRoleName, roleSettings)
      notification.success('Role Defaults Updated', `Defaults for ${effectiveRoleName} were saved successfully`)
    } catch {
      toast.error('Unable to save role defaults')
    } finally {
      setIsSavingRoleDefaults(false)
    }
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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <Link
          to="/profile/access"
          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100"
        >
          <Shield className="h-4 w-4" aria-hidden />
          View my access
        </Link>
      </div>

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

                return (
                  <div
                    key={provider}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon size={20} className="text-gray-600" />}
                      <div>
                        <p className="font-medium">{providerLabels[provider] || key}</p>
                        <p className="text-sm text-gray-500">Disabled in local mode</p>
                      </div>
                    </div>

                    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                      Local mode only
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold">Personal Preferences</h3>
                <p className="text-sm text-gray-600">These settings affect only your account and local UI behavior.</p>
              </div>
              {isLoadingPreferences && (
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Syncing</span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <select
                  value={personalSettings.theme}
                  onChange={(e) => handlePersonalSettingChange('theme', e.target.value as UserSettings['theme'])}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={personalSettings.language}
                  onChange={(e) => handlePersonalSettingChange('language', e.target.value as UserSettings['language'])}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <input
                  type="text"
                  value={personalSettings.timezone}
                  onChange={(e) => handlePersonalSettingChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Africa/Lagos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items Per Page</label>
                <select
                  value={personalSettings.itemsPerPage}
                  onChange={(e) => handlePersonalSettingChange('itemsPerPage', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>

              <label className="flex items-center gap-2 rounded-lg border px-3 py-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={personalSettings.notificationsEnabled}
                  onChange={(e) => handlePersonalSettingChange('notificationsEnabled', e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">Enable notifications</span>
              </label>

              <label className="flex items-center gap-2 rounded-lg border px-3 py-3">
                <input
                  type="checkbox"
                  checked={personalSettings.inAppNotifications}
                  onChange={(e) => handlePersonalSettingChange('inAppNotifications', e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">In-app notifications</span>
              </label>

              <label className="flex items-center gap-2 rounded-lg border px-3 py-3">
                <input
                  type="checkbox"
                  checked={personalSettings.emailNotifications}
                  onChange={(e) => handlePersonalSettingChange('emailNotifications', e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">Email notifications</span>
              </label>

              <label className="flex items-center gap-2 rounded-lg border px-3 py-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={personalSettings.autoRefresh}
                  onChange={(e) => handlePersonalSettingChange('autoRefresh', e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">Auto refresh dashboard data</span>
              </label>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSavePersonalSettings}
                disabled={isSavingPreferences}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition"
              >
                {isSavingPreferences ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>

          {canManageRoleDefaults && effectiveRoleName && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-bold">Role Defaults</h3>
                  <p className="text-sm text-gray-600">These values seed the defaults for users whose primary role is <span className="font-medium">{effectiveRoleName.replace('_', ' ')}</span>.</p>
                </div>
                <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Admin only
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <select
                    value={roleSettings.theme}
                    onChange={(e) => handleRoleSettingChange('theme', e.target.value as UserSettings['theme'])}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={roleSettings.language}
                    onChange={(e) => handleRoleSettingChange('language', e.target.value as UserSettings['language'])}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <input
                    type="text"
                    value={roleSettings.timezone}
                    onChange={(e) => handleRoleSettingChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Items Per Page</label>
                  <select
                    value={roleSettings.itemsPerPage}
                    onChange={(e) => handleRoleSettingChange('itemsPerPage', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 rounded-lg border px-3 py-3 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={roleSettings.notificationsEnabled}
                    onChange={(e) => handleRoleSettingChange('notificationsEnabled', e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">Enable notifications</span>
                </label>

                <label className="flex items-center gap-2 rounded-lg border px-3 py-3">
                  <input
                    type="checkbox"
                    checked={roleSettings.inAppNotifications}
                    onChange={(e) => handleRoleSettingChange('inAppNotifications', e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">In-app notifications</span>
                </label>

                <label className="flex items-center gap-2 rounded-lg border px-3 py-3">
                  <input
                    type="checkbox"
                    checked={roleSettings.emailNotifications}
                    onChange={(e) => handleRoleSettingChange('emailNotifications', e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">Email notifications</span>
                </label>

                <label className="flex items-center gap-2 rounded-lg border px-3 py-3 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={roleSettings.autoRefresh}
                    onChange={(e) => handleRoleSettingChange('autoRefresh', e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">Auto refresh dashboard data</span>
                </label>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSaveRoleDefaults}
                  disabled={isSavingRoleDefaults}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition"
                >
                  {isSavingRoleDefaults ? 'Saving...' : 'Save Role Defaults'}
                </button>
              </div>
            </div>
          )}

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
