import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reservationsApi } from '../api/reservations'
import { reviewsApi } from '../api/reviews'
import { useAuthStore } from '../store/authStore'
import { ReservationStatusBadge } from '../components/ReservationStatusBadge'
import { getApiErrorMessage } from '../api/error'
import type { ReservationStatus } from '../types'

const STATUS_OPTIONS: ReservationStatus[] = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED']

export function MyReservationsPage() {
  const user = useAuthStore((state) => state.user)
  const role = user?.role === 'TUTOR' ? 'TUTOR' : 'STUDENT'
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | ''>('')
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-reservations', role, statusFilter],
    queryFn: () => reservationsApi.getMy(role, statusFilter || undefined),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ReservationStatus }) =>
      reservationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] })
    },
  })

  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set())

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        내 예약 {role === 'TUTOR' ? '(튜터)' : '(학생)'}
      </h1>

      <div className="mb-6">
        <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
          상태 필터
        </label>
        <select
          id="status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | '')}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        >
          <option value="">전체</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-sm text-gray-500">불러오는 중...</p>}
      {isError && <p className="text-sm text-red-600">예약 목록을 불러오지 못했습니다.</p>}
      {data && data.length === 0 && <p className="text-sm text-gray-500">예약 내역이 없습니다.</p>}

      {statusMutation.isError && (
        <p className="mb-4 text-sm text-red-600">
          {getApiErrorMessage(statusMutation.error, '처리에 실패했습니다.')}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {data?.map((reservation) => (
          <li key={reservation.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {role === 'TUTOR' ? reservation.studentName : reservation.tutorName}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {reservation.slotDate} {reservation.startTime.slice(0, 5)}-{reservation.endTime.slice(0, 5)}
                </p>
                {reservation.message && <p className="mt-2 text-sm text-gray-700">{reservation.message}</p>}
              </div>
              <ReservationStatusBadge status={reservation.status} />
            </div>

            <ReservationActions
              role={role}
              status={reservation.status}
              disabled={statusMutation.isPending}
              onChangeStatus={(status) => statusMutation.mutate({ id: reservation.id, status })}
            />

            {role === 'STUDENT' && reservation.status === 'COMPLETED' && !reviewedIds.has(reservation.id) && (
              <ReviewForm
                reservationId={reservation.id}
                onSubmitted={() => setReviewedIds((prev) => new Set(prev).add(reservation.id))}
              />
            )}
            {role === 'STUDENT' && reservation.status === 'COMPLETED' && reviewedIds.has(reservation.id) && (
              <p className="mt-3 text-xs text-gray-500">리뷰를 작성했습니다.</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ReservationActions({
  role,
  status,
  disabled,
  onChangeStatus,
}: {
  role: 'STUDENT' | 'TUTOR'
  status: ReservationStatus
  disabled: boolean
  onChangeStatus: (status: ReservationStatus) => void
}) {
  const buttonClass = 'text-xs font-medium hover:underline disabled:opacity-50'

  if (role === 'TUTOR' && status === 'PENDING') {
    return (
      <div className="mt-3 flex gap-4">
        <button type="button" disabled={disabled} onClick={() => onChangeStatus('CONFIRMED')} className={`${buttonClass} text-blue-600`}>
          승인
        </button>
        <button type="button" disabled={disabled} onClick={() => onChangeStatus('REJECTED')} className={`${buttonClass} text-red-600`}>
          거절
        </button>
      </div>
    )
  }

  if (role === 'TUTOR' && status === 'CONFIRMED') {
    return (
      <div className="mt-3 flex gap-4">
        <button type="button" disabled={disabled} onClick={() => onChangeStatus('COMPLETED')} className={`${buttonClass} text-green-600`}>
          완료 처리
        </button>
        <button type="button" disabled={disabled} onClick={() => onChangeStatus('CANCELLED')} className={`${buttonClass} text-red-600`}>
          예약 취소
        </button>
      </div>
    )
  }

  if (role === 'STUDENT' && (status === 'PENDING' || status === 'CONFIRMED')) {
    return (
      <div className="mt-3">
        <button type="button" disabled={disabled} onClick={() => onChangeStatus('CANCELLED')} className={`${buttonClass} text-red-600`}>
          예약 취소
        </button>
      </div>
    )
  }

  return null
}

function ReviewForm({ reservationId, onSubmitted }: { reservationId: number; onSubmitted: () => void }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const queryClient = useQueryClient()

  const reviewMutation = useMutation({
    mutationFn: () => reviewsApi.create(reservationId, { rating, comment: comment || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['tutor'] })
      onSubmitted()
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    reviewMutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3">
      <label htmlFor={`rating-${reservationId}`} className="mb-1 block text-xs font-medium text-gray-700">
        별점
      </label>
      <select
        id={`rating-${reservationId}`}
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="mb-2 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none"
      >
        {[5, 4, 3, 2, 1].map((value) => (
          <option key={value} value={value}>
            {'★'.repeat(value)} ({value})
          </option>
        ))}
      </select>
      <textarea
        rows={2}
        placeholder="리뷰 내용 (선택)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
      />
      {reviewMutation.isError && (
        <p className="mt-1 text-xs text-red-600">{getApiErrorMessage(reviewMutation.error, '리뷰 작성에 실패했습니다.')}</p>
      )}
      <button
        type="submit"
        disabled={reviewMutation.isPending}
        className="mt-2 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {reviewMutation.isPending ? '제출 중...' : '리뷰 작성'}
      </button>
    </form>
  )
}
