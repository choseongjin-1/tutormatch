import { Link } from 'react-router-dom'
import type { TutorProfile } from '../types'

export function TutorCard({ tutor }: { tutor: TutorProfile }) {
  return (
    <Link
      to={`/tutors/${tutor.tutorId}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-400 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{tutor.subject}</p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900">{tutor.name}</h3>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            ★ {tutor.avgRating.toFixed(1)}{' '}
            <span className="font-normal text-gray-500">({tutor.reviewCount})</span>
          </p>
          <p className="mt-1 text-sm text-gray-600">{tutor.hourlyRate.toLocaleString()}원/시간</p>
        </div>
      </div>
      {tutor.bio && <p className="mt-3 line-clamp-2 text-sm text-gray-600">{tutor.bio}</p>}
    </Link>
  )
}
