import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">페이지를 찾을 수 없습니다</h1>
      <Link to="/tutors" className="text-sm text-blue-600 hover:underline">
        튜터 목록으로 돌아가기
      </Link>
    </div>
  )
}
