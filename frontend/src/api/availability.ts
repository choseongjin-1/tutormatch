import { apiClient } from './client'
import type { AvailabilitySlot } from '../types'

export interface SlotPayload {
  slotDate: string
  startTime: string
  endTime: string
}

export const availabilityApi = {
  getByTutor: (tutorId: number, from: string, to: string) =>
    apiClient
      .get<AvailabilitySlot[]>(`/tutors/${tutorId}/availability`, { params: { from, to } })
      .then((res) => res.data),
  createSlot: (tutorId: number, payload: SlotPayload) =>
    apiClient.post<AvailabilitySlot>(`/tutors/${tutorId}/availability`, payload).then((res) => res.data),
  deleteSlot: (slotId: number) => apiClient.delete<void>(`/availability/${slotId}`).then((res) => res.data),
}
