import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const apiClient = axios.create({ baseURL })

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, user } = useAuthStore.getState()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
  const { accessToken, refreshToken: newRefreshToken, user: refreshedUser } = response.data

  useAuthStore.getState().setAuth({
    accessToken,
    refreshToken: newRefreshToken,
    user: refreshedUser ?? user!,
  })

  return accessToken
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined

    const isAuthEndpoint = originalRequest?.url?.includes('/auth/')
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      refreshPromise ??= refreshAccessToken()
      const newAccessToken = await refreshPromise
      refreshPromise = null
      originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`)
      return apiClient(originalRequest)
    } catch (refreshError) {
      refreshPromise = null
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    }
  },
)
