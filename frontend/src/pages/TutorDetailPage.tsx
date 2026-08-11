import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { tutorsApi } from '../api/tutors'
import { availabilityApi } from '../api/availability'

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function TutorDetailPage() {
  const { tutorId } = useParams<{ tutorId: string }>()
  const id = Number(tutorId)

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

  if (isLoading) return <p className="text-sm text-gray-500">불러오는 중...</p>
  if (isError || !tutor) return <p className="text-sm text-red-600">튜터 정보를 불러오지 못했습니다.</p>

  const availableSlots = slots?.filter((slot) => !slot.booked) ?? []

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
        {availableSlots.length === 0 ? (
          <p className="text-sm text-gray-500">현재 예약 가능한 시간이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {availableSlots.map((slot) => (
              <li
                key={slot.id}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700"
              >
                {slot.slotDate} {slot.startTime.slice(0, 5)}-{slot.endTime.slice(0, 5)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
