import { apiClient } from './client'
import type { Role, User } from '../types'

export interface SignupPayload {
  email: string
  password: string
  name: string
  role: Role
  phone?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: User
}

export const authApi = {
  signup: (payload: SignupPayload) => apiClient.post<User>('/auth/signup', payload).then((res) => res.data),
  login: (payload: LoginPayload) => apiClient.post<TokenResponse>('/auth/login', payload).then((res) => res.data),
}
