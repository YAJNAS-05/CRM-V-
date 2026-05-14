import axiosInstance from './axiosInstance'

export const supabaseAdminApi = {
  createUser: (data: { email: string; password?: string; user_metadata?: Record<string, any> }) =>
    axiosInstance.post('/internal/supabase/create', data),

  inviteUser: (data: { email: string; redirect_to?: string }) =>
    axiosInstance.post('/internal/supabase/invite', data),
}

export default supabaseAdminApi
