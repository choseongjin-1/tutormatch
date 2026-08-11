import { apiClient } from './client'
import type { Page, TutorProfile } from '../types'

export interface TutorSearchParams {
  subject?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  size?: number
}

export interface TutorProfilePayload {
  subject: string
  bio?: string
  hourlyRate: number
  career?: string
}

export const tutorsApi = {
  search: (params: TutorSearchParams) =>
    apiClient.get<Page<TutorProfile>>('/tutors', { params }).then((res) => res.data),
  getDetail: (tutorId: number) => apiClient.get<TutorProfile>(`/tutors/${tutorId}`).then((res) => res.data),
  createProfile: (payload: TutorProfilePayload) =>
    apiClient.post<TutorProfile>('/tutors/profile', payload).then((res) => res.data),
  updateProfile: (payload: TutorProfilePayload) =>
    apiClient.put<TutorProfile>('/tutors/profile', payload).then((res) => res.data),
}
