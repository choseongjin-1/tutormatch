import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tutorsApi } from '../api/tutors'
import { TutorCard } from '../components/TutorCard'

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
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">튜터 찾기</h1>
      <form onSubmit={handleSearch} className="mb-8 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-700">
            과목
          </label>
          <input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="예: Math"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="minPrice" className="mb-1 block text-sm font-medium text-gray-700">
            최소 시급
          </label>
          <input
            id="minPrice"
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="mb-1 block text-sm font-medium text-gray-700">
            최대 시급
          </label>
          <input
            id="maxPrice"
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          검색
        </button>
      </form>

      {isLoading && <p className="text-sm text-gray-500">불러오는 중...</p>}
      {isError && <p className="text-sm text-red-600">튜터 목록을 불러오지 못했습니다.</p>}
      {data && data.content.length === 0 && (
        <p className="text-sm text-gray-500">검색 조건에 맞는 튜터가 없습니다.</p>
      )}

      {data && data.content.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.content.map((tutor) => (
              <TutorCard key={tutor.tutorId} tutor={tutor} />
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-40"
            >
              이전
            </button>
            <span className="text-sm text-gray-600">
              {data.number + 1} / {Math.max(data.totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={data.number + 1 >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  )
}
