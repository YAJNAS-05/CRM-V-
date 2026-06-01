import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type UserSettings } from '../types'

interface SettingsStore {
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void
  replaceSettings: (settings: UserSettings) => void
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

      replaceSettings: (settings) => {
        set({ settings })
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
