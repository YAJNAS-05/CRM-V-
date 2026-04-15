import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserSettings {
  theme: 'light' | 'dark'
  language: 'en' | 'es' | 'fr' | 'de'
  timezone: string
  notificationsEnabled: boolean
  emailNotifications: boolean
  inAppNotifications: boolean
  autoRefresh: boolean
  itemsPerPage: number
}

interface SettingsStore {
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void
  resetSettings: () => void
}

const defaultSettings: UserSettings = {
  theme: 'light',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notificationsEnabled: true,
  emailNotifications: true,
  inAppNotifications: true,
  autoRefresh: true,
  itemsPerPage: 25,
}

/**
 * Settings store - persists user preferences to localStorage
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }))
      },

      resetSettings: () => {
        set({ settings: defaultSettings })
      },
    }),
    {
      name: 'everx-settings',
    }
  )
)
