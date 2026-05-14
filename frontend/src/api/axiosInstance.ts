import axios, { AxiosInstance } from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080/api`

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const isSupabaseAccessToken = (token: string | null) => {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false

  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload?.iss === 'string' && payload.iss.includes('supabase.co/auth/v1')
  } catch {
    return false
  }
}

// Request interceptor to add JWT token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Shared refresh promise to prevent concurrent token refresh requests
let refreshPromise: Promise<string> | null = null

// Response interceptor to handle token refresh on 401 and global error toasts
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const state = useAuthStore.getState()
    const currentAccessToken = state.accessToken

    // Only attempt refresh if 401 and not already retried
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isSupabaseAccessToken(currentAccessToken)) {
        return Promise.reject(error)
      }

      originalRequest._retry = true
      const { refreshToken, logout } = state

      if (refreshToken) {
        try {
          // Use single refresh promise to avoid multiple concurrent refresh requests
          if (!refreshPromise) {
            refreshPromise = axios
              .post(`${API_URL}/v1/auth/refresh`, { refreshToken })
              .then((r) => {
                const data = r.data?.data
                if (!data?.accessToken) {
                  throw new Error('Invalid refresh response')
                }

                const {
                  setAccessToken,
                  setRefreshToken,
                  setUser,
                } = useAuthStore.getState()

                setAccessToken(data.accessToken)
                if (data.refreshToken) {
                  setRefreshToken(data.refreshToken)
                }
                if (data.user) {
                  setUser(data.user)
                }

                return data.accessToken as string
              })
              .finally(() => { refreshPromise = null })
          }

          const accessToken = await refreshPromise
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          refreshPromise = null
          logout()
          toast.error('Session expired. Please log in again.')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        logout()
        toast.error('Session expired. Please log in again.')
        window.location.href = '/login'
      }
    }

    // Global Error Toasts for other errors
    if (!originalRequest._silent) { // Allow components to silence errors if needed
        const status = error.response?.status
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred'
        
        if (status >= 500) {
            toast.error(`Server Error: ${errorMessage}`)
        } else if (status === 400 || status === 404) {
            toast.error(errorMessage)
        } else if (!error.response && error.code === 'ERR_NETWORK') {
             toast.error('Network error. Please check your connection.')
        }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
