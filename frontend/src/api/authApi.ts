import axiosInstance from './axiosInstance'
import { supabase, OAuthProvider } from '../lib/supabaseClient'
import { LoginRequest, LoginResponse, ApiResponse, User } from '../types'

export const authApi = {
  // Local backend email/password login
  signInWithEmail: async (email: string, password: string): Promise<LoginResponse | null> => {
    return authApi.login({ email, password })
  },

  // Legacy backend login (kept for compatibility, but not used)
  login: async (credentials: LoginRequest): Promise<LoginResponse | null> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>('/v1/auth/login', credentials)
    return response.data?.data || null
  },

  register: async (payload: { email: string; password: string; fullName: string; phone?: string }): Promise<User | null> => {
    const response = await axiosInstance.post<ApiResponse<User>>('/v1/auth/register', payload)
    return response.data?.data || null
  },

  me: async (): Promise<User | null> => {
    const response = await axiosInstance.get<ApiResponse<User>>('/v1/auth/me')
    return response.data?.data || null
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse | null> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>('/v1/auth/refresh', {
      refreshToken,
    })
    return response.data?.data || null
  },

  logout: async (refreshToken: string): Promise<void> => {
    await axiosInstance.post('/v1/auth/logout', { refreshToken })
  },

  // OAuth Methods
  signInWithOAuth: async (provider: OAuthProvider) => {
    throw new Error(`OAuth (${provider}) is disabled in local auth mode`)
  },

  getConnectedProviders: async (): Promise<string[]> => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session?.user) return []

      const identities = session.session.user.identities || []
      return identities.map((id: any) => id.provider)
    } catch (error) {
      console.error('Error fetching connected providers:', error)
      return []
    }
  },

  linkOAuthProvider: async (provider: OAuthProvider) => {
    try {
      const { data, error } = await supabase.auth.linkIdentity({
        provider: provider as any,
      })

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error: any) {
      throw new Error(error.message || `Failed to link ${provider}`)
    }
  },

  unlinkOAuthProvider: async (provider: OAuthProvider) => {
    try {
      const { data, error } = await supabase.auth.unlinkIdentity({
        identity_id: provider,
      } as any)

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error: any) {
      throw new Error(error.message || `Failed to unlink ${provider}`)
    }
  },

  getCurrentSession: async () => {
    try {
      const { data } = await supabase.auth.getSession()
      return data.session
    } catch (error) {
      console.error('Error fetching session:', error)
      return null
    }
  },
}
