import axios, { AxiosInstance } from 'axios'
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

// Response interceptor to handle token refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only attempt refresh if 401 and not already retried
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true
      const { refreshToken, setAccessToken, logout } = useAuthStore.getState()

      if (refreshToken) {
        try {
          // Use single refresh promise to avoid multiple concurrent refresh requests
          if (!refreshPromise) {
            refreshPromise = axios
              .post(`${API_URL}/v1/auth/refresh`, { refreshToken })
              .then((r) => r.data.data.accessToken)
              .finally(() => { refreshPromise = null })
          }

          const accessToken = await refreshPromise
          setAccessToken(accessToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          refreshPromise = null
          logout()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
