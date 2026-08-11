import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tutorsApi } from '../api/tutors'
import { availabilityApi } from '../api/availability'
import { reservationsApi } from '../api/reservations'
import { useAuthStore } from '../store/authStore'
import { getApiErrorMessage } from '../api/error'
import type { AvailabilitySlot } from '../types'

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function TutorDetailPage() {
  const { tutorId } = useParams<{ tutorId: string }>()
  const id = Number(tutorId)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)
  const [message, setMessage] = useState('')

  const { data: tutor, isLoading, isError } = useQuery({
    queryKey: ['tutor', id],
    queryFn: () => tutorsApi.getDetail(id),
  })

  const today = toIsoDate(new Date())
  const in30Days = toIsoDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

  const { data: slots } = useQuery({
    queryKey: ['availability', id, today, in30Days],
    queryFn: () => availabilityApi.getByTutor(id, today, in30Days),
  })

  const reserveMutation = useMutation({
    mutationFn: () => reservationsApi.create({ slotId: selectedSlot!.id, message: message || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', id] })
      navigate('/reservations')
    },
  })

  if (isLoading) return <p className="text-sm text-gray-500">불러오는 중...</p>
  if (isError || !tutor) return <p className="text-sm text-red-600">튜터 정보를 불러오지 못했습니다.</p>

  const availableSlots = slots?.filter((slot) => !slot.booked) ?? []
  const canReserve = user?.role === 'STUDENT'

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{tutor.subject}</p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">{tutor.name}</h1>
        <p className="mt-1 text-sm text-gray-600">
          ★ {tutor.avgRating.toFixed(1)} ({tutor.reviewCount}개 리뷰) · {tutor.hourlyRate.toLocaleString()}원/시간
        </p>
        {tutor.bio && <p className="mt-4 whitespace-pre-line text-sm text-gray-700">{tutor.bio}</p>}
        {tutor.career && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold text-gray-900">경력</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-gray-700">{tutor.career}</p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">예약 가능한 시간 (앞으로 30일)</h2>
        {!user && (
          <p className="mb-3 text-sm text-gray-500">
            예약하려면 <Link to="/login" className="underline">로그인</Link>이 필요합니다.
          </p>
        )}
        {user && !canReserve && <p className="mb-3 text-sm text-gray-500">학생 계정만 예약할 수 있습니다.</p>}

        {availableSlots.length === 0 ? (
          <p className="text-sm text-gray-500">현재 예약 가능한 시간이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {availableSlots.map((slot) => (
              <li key={slot.id}>
                <button
                  type="button"
                  disabled={!canReserve}
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                    selectedSlot?.id === slot.id
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  } ${!canReserve ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  {slot.slotDate} {slot.startTime.slice(0, 5)}-{slot.endTime.slice(0, 5)}
                </button>
              </li>
            ))}
          </ul>
        )}

        {selectedSlot && canReserve && (
          <div className="mt-5 rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-sm font-medium text-gray-900">
              {selectedSlot.slotDate} {selectedSlot.startTime.slice(0, 5)}-{selectedSlot.endTime.slice(0, 5)} 예약
              신청
            </p>
            <textarea
              rows={2}
              placeholder="튜터에게 전달할 메시지 (선택)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
            {reserveMutation.isError && (
              <p className="mt-2 text-sm text-red-600">
                {getApiErrorMessage(reserveMutation.error, '예약 신청에 실패했습니다.')}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={reserveMutation.isPending}
                onClick={() => reserveMutation.mutate()}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {reserveMutation.isPending ? '신청 중...' : '신청하기'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
