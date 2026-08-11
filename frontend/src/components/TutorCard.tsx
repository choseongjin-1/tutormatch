import { Link } from 'react-router-dom'
import type { TutorProfile } from '../types'

export function TutorCard({ tutor }: { tutor: TutorProfile }) {
  return (
    <Link
      to={`/tutors/${tutor.tutorId}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
            {tutor.subject}
          </p>
          <h3 className="mt-2 truncate text-lg font-semibold text-slate-900 group-hover:text-indigo-600">
            {tutor.name} 선생님
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-amber-500">
            ★ {tutor.avgRating.toFixed(1)}{' '}
            <span className="font-normal text-slate-400">({tutor.reviewCount})</span>
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">{tutor.hourlyRate.toLocaleString()}원/시간</p>
        </div>
      </div>
      {tutor.bio && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{tutor.bio}</p>}
    </Link>
  )
}
