import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reservationsApi } from '../api/reservations'
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

  const cancelMutation = useMutation({
    mutationFn: (id: number) => reservationsApi.updateStatus(id, 'CANCELLED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] })
    },
  })

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

      {cancelMutation.isError && (
        <p className="mb-4 text-sm text-red-600">
          {getApiErrorMessage(cancelMutation.error, '취소에 실패했습니다.')}
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
            {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
              <div className="mt-3">
                <button
                  type="button"
                  disabled={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate(reservation.id)}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  예약 취소
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
