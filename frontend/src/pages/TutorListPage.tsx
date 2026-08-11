import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tutorsApi } from '../api/tutors'
import { TutorCard } from '../components/TutorCard'
import { Spinner } from '../components/Spinner'
import { inputClass, labelClass, primaryButtonClass } from '../styles/ui'

export function TutorListPage() {
  const [subject, setSubject] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({ subject: '', minPrice: '', maxPrice: '' })
  const [page, setPage] = useState(0)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tutors', appliedFilters, page],
    queryFn: () =>
      tutorsApi.search({
        subject: appliedFilters.subject || undefined,
        minPrice: appliedFilters.minPrice ? Number(appliedFilters.minPrice) : undefined,
        maxPrice: appliedFilters.maxPrice ? Number(appliedFilters.maxPrice) : undefined,
        page,
        size: 12,
      }),
  })

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    setPage(0)
    setAppliedFilters({ subject, minPrice, maxPrice })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">과외 선생님 찾기</h1>
      <p className="mt-1 text-sm text-slate-500">과목과 시급으로 딱 맞는 선생님을 찾아보세요.</p>

      <form
        onSubmit={handleSearch}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div>
          <label htmlFor="subject" className={labelClass}>
            과목
          </label>
          <input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="예: 수학"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="minPrice" className={labelClass}>
            최소 시급
          </label>
          <input
            id="minPrice"
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className={`w-28 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className={labelClass}>
            최대 시급
          </label>
          <input
            id="maxPrice"
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className={`w-28 ${inputClass}`}
          />
        </div>
        <button type="submit" className={primaryButtonClass}>
          검색
        </button>
      </form>

      {isLoading && <Spinner />}
      {isError && <p className="mt-8 text-sm text-red-600">과외 선생님 목록을 불러오지 못했습니다.</p>}
      {data && data.content.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
          검색 조건에 맞는 선생님이 없습니다.
        </p>
      )}

      {data && data.content.length > 0 && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.content.map((tutor) => (
              <TutorCard key={tutor.tutorId} tutor={tutor} />
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              이전
            </button>
            <span className="text-sm text-slate-600">
              {data.number + 1} / {Math.max(data.totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={data.number + 1 >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  )
}
