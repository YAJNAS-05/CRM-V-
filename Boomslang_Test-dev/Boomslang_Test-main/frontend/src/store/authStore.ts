import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'

const normalizeUser = (user: User | null): User | null => {
  if (!user) return null

  const normalizedPermissions = Array.from(
    new Set(
      (user.permissions || [])
        .filter((permission): permission is string => typeof permission === 'string')
        .map((permission) => permission.trim().toUpperCase())
        .filter((permission) => permission.length > 0)
    )
  )

  const normalizedRoles = Array.from(
    new Set(
      (user.roles || [])
        .filter((role): role is string => typeof role === 'string')
        .map((role) => role.trim().toUpperCase())
        .filter((role) => role.length > 0)
    )
  )

  return {
    ...user,
    role: typeof user.role === 'string' ? user.role.trim().toUpperCase() : user.role,
    roles: normalizedRoles,
    permissions: normalizedPermissions,
  }
}

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  setIsLoading: (loading: boolean) => void
  login: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({
          user: normalizeUser(user),
          isAuthenticated: Boolean(get().accessToken && get().refreshToken && normalizeUser(user)),
        }),
      setAccessToken: (accessToken) =>
        set({
          accessToken,
          isAuthenticated: Boolean(accessToken && get().refreshToken && get().user),
        }),
      setRefreshToken: (refreshToken) =>
        set({
          refreshToken,
          isAuthenticated: Boolean(refreshToken && get().accessToken && get().user),
        }),
      setIsLoading: (isLoading) => set({ isLoading }),

      login: (user, accessToken, refreshToken) =>
        set({
          user: normalizeUser(user),
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'everx_auth_store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const hasSession = Boolean(state.user && state.accessToken && state.refreshToken)
        state.setIsLoading(false)
        if (hasSession) {
          state.login(state.user!, state.accessToken!, state.refreshToken!)
        } else {
          state.logout()
        }
      },
    }
  )
)
