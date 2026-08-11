export type Role = 'STUDENT' | 'TUTOR' | 'ADMIN'

export interface User {
  id: number
  email: string
  name: string
  role: Role
  phone: string | null
}

export interface TutorProfile {
  tutorId: number
  userId: number
  name: string
  email: string
  subject: string
  bio: string | null
  hourlyRate: number
  career: string | null
  avgRating: number
  reviewCount: number
}

export interface AvailabilitySlot {
  id: number
  tutorId: number
  slotDate: string
  startTime: string
  endTime: string
  booked: boolean
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'

export interface Reservation {
  id: number
  studentId: number
  studentName: string
  tutorId: number
  tutorName: string
  slotId: number
  slotDate: string
  startTime: string
  endTime: string
  status: ReservationStatus
  message: string | null
  createdAt: string
}

export interface Review {
  id: number
  reservationId: number
  studentName: string
  rating: number
  comment: string | null
  createdAt: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
