import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`
const SHOULD_PREFIX_API = !API_URL.endsWith('/api')

const resolveApiRoot = (): string => {
  if (API_URL.startsWith('http')) {
    return API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`
  }
  return API_URL.endsWith('/api') ? API_URL : '/api'
}

const buildRefreshUrl = (): string => `${resolveApiRoot()}/v1/auth/refresh`

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Ensure URL starts with /api only when the base URL does not already include it
    if (SHOULD_PREFIX_API && config.url && typeof config.url === 'string' && !config.url.startsWith('http')) {
      if (!config.url.startsWith('/api')) {
        config.url = `/api${config.url}`
      }
    }

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

const isAuthRefreshRequest = (config?: InternalAxiosRequestConfig): boolean =>
  Boolean(config?.url?.includes('/auth/refresh'))

// Response interceptor to handle token refresh on 401 and global error toasts
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const state = useAuthStore.getState()
    const silent = Boolean(originalRequest?._silent) || isAuthRefreshRequest(originalRequest)

    // Only attempt refresh if 401 and not already retried
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true
      const { refreshToken, logout } = state

      if (refreshToken) {
        try {
          // Use single refresh promise to avoid multiple concurrent refresh requests
          if (!refreshPromise) {
            refreshPromise = axios
              .post(buildRefreshUrl(), { refreshToken }, { _silent: true })
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
          if (!silent) {
            toast.error('Session expired. Please log in again.')
          }
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        logout()
        if (!silent) {
          toast.error('Session expired. Please log in again.')
        }
        window.location.href = '/login'
      }
    }

    // Clear stale sessions when refresh token is invalid (common after backend restarts)
    if (
      isAuthRefreshRequest(originalRequest) &&
      (error.response?.status === 400 || error.response?.status === 401)
    ) {
      state.logout()
      return Promise.reject(error)
    }

    // Global Error Toasts for other errors
    if (!silent) {
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
