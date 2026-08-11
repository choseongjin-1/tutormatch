import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tutorsApi } from '../api/tutors'
import { availabilityApi } from '../api/availability'
import { reservationsApi } from '../api/reservations'
import { reviewsApi } from '../api/reviews'
import { useAuthStore } from '../store/authStore'
import { getApiErrorMessage } from '../api/error'
import { Spinner } from '../components/Spinner'
import { cardClass, primaryButtonClass, secondaryButtonClass } from '../styles/ui'
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

  const [reviewPage, setReviewPage] = useState(0)
  const { data: reviews } = useQuery({
    queryKey: ['reviews', id, reviewPage],
    queryFn: () => reviewsApi.getByTutor(id, reviewPage),
  })

  const reserveMutation = useMutation({
    mutationFn: () => reservationsApi.create({ slotId: selectedSlot!.id, message: message || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', id] })
      navigate('/reservations')
    },
  })

  if (isLoading) return <Spinner />
  if (isError || !tutor) return <p className="text-sm text-red-600">선생님 정보를 불러오지 못했습니다.</p>

  const availableSlots = slots?.filter((slot) => !slot.booked) ?? []
  const canReserve = user?.role === 'STUDENT'

  return (
    <div className="mx-auto max-w-3xl">
      <div className={cardClass}>
        <p className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
          {tutor.subject}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{tutor.name} 선생님</h1>
        <p className="mt-1 text-sm text-slate-600">
          <span className="font-semibold text-amber-500">★ {tutor.avgRating.toFixed(1)}</span> ({tutor.reviewCount}개
          리뷰) · <span className="font-medium text-slate-900">{tutor.hourlyRate.toLocaleString()}원/시간</span>
        </p>
        {tutor.bio && <p className="mt-4 whitespace-pre-line text-sm text-slate-700">{tutor.bio}</p>}
        {tutor.career && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h2 className="text-sm font-semibold text-slate-900">경력</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{tutor.career}</p>
          </div>
        )}
      </div>

      <div className={`mt-6 ${cardClass}`}>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">예약 가능한 시간 (앞으로 30일)</h2>
        {!user && (
          <p className="mb-3 text-sm text-slate-500">
            예약하려면{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:underline">
              로그인
            </Link>
            이 필요합니다.
          </p>
        )}
        {user && !canReserve && <p className="mb-3 text-sm text-slate-500">학생 계정만 예약할 수 있습니다.</p>}

        {availableSlots.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-sm text-slate-500">
            현재 예약 가능한 시간이 없습니다.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {availableSlots.map((slot) => (
              <li key={slot.id}>
                <button
                  type="button"
                  disabled={!canReserve}
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                    selectedSlot?.id === slot.id
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                  } ${!canReserve ? 'cursor-not-allowed opacity-60 hover:border-slate-200 hover:bg-transparent' : ''}`}
                >
                  {slot.slotDate} {slot.startTime.slice(0, 5)}-{slot.endTime.slice(0, 5)}
                </button>
              </li>
            ))}
          </ul>
        )}

        {selectedSlot && canReserve && (
          <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-900">
              {selectedSlot.slotDate} {selectedSlot.startTime.slice(0, 5)}-{selectedSlot.endTime.slice(0, 5)} 예약
              신청
            </p>
            <textarea
              rows={2}
              placeholder="선생님께 전달할 메시지 (선택)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                className={primaryButtonClass}
              >
                {reserveMutation.isPending ? '신청 중...' : '신청하기'}
              </button>
              <button type="button" onClick={() => setSelectedSlot(null)} className={secondaryButtonClass}>
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`mt-6 ${cardClass}`}>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">리뷰 ({tutor.reviewCount})</h2>
        {reviews && reviews.content.length === 0 && <p className="text-sm text-slate-500">아직 리뷰가 없습니다.</p>}
        {reviews && reviews.content.length > 0 && (
          <>
            <ul className="flex flex-col gap-4">
              {reviews.content.map((review) => (
                <li key={review.id} className="border-b border-slate-100 pb-4 last:border-none last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      <span className="text-amber-500">★ {review.rating}</span> · {review.studentName}
                    </p>
                    <p className="text-xs text-slate-400">{review.createdAt.slice(0, 10)}</p>
                  </div>
                  {review.comment && <p className="mt-1 text-sm text-slate-700">{review.comment}</p>}
                </li>
              ))}
            </ul>
            {reviews.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={reviewPage === 0}
                  onClick={() => setReviewPage((p) => p - 1)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  이전
                </button>
                <span className="text-sm text-slate-600">
                  {reviews.number + 1} / {reviews.totalPages}
                </span>
                <button
                  type="button"
                  disabled={reviews.number + 1 >= reviews.totalPages}
                  onClick={() => setReviewPage((p) => p + 1)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
