import type { ReservationStatus } from '../types'

const STYLES: Record<ReservationStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
  COMPLETED: 'bg-green-100 text-green-800',
}

const LABELS: Record<ReservationStatus, string> = {
  PENDING: '대기중',
  CONFIRMED: '확정',
  REJECTED: '거절됨',
  CANCELLED: '취소됨',
  COMPLETED: '완료',
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>{LABELS[status]}</span>
  )
}
