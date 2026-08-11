import { apiClient } from './client'
import type { Page, Review } from '../types'

export interface ReviewPayload {
  rating: number
  comment?: string
}

export const reviewsApi = {
  create: (reservationId: number, payload: ReviewPayload) =>
    apiClient.post<Review>(`/reservations/${reservationId}/review`, payload).then((res) => res.data),
  getByTutor: (tutorId: number, page = 0) =>
    apiClient.get<Page<Review>>(`/tutors/${tutorId}/reviews`, { params: { page } }).then((res) => res.data),
}
