import { apiClient } from './client'
import type { Reservation, ReservationStatus } from '../types'

export interface ReservationCreatePayload {
  slotId: number
  message?: string
}

export const reservationsApi = {
  create: (payload: ReservationCreatePayload) =>
    apiClient.post<Reservation>('/reservations', payload).then((res) => res.data),
  getMy: (role: 'STUDENT' | 'TUTOR', status?: ReservationStatus) =>
    apiClient.get<Reservation[]>('/reservations/me', { params: { role, status } }).then((res) => res.data),
  getDetail: (id: number) => apiClient.get<Reservation>(`/reservations/${id}`).then((res) => res.data),
  updateStatus: (id: number, status: ReservationStatus) =>
    apiClient.patch<Reservation>(`/reservations/${id}/status`, { status }).then((res) => res.data),
}
