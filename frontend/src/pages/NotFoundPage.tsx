import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="text-6xl font-black text-indigo-100">404</p>
      <h1 className="text-xl font-bold text-slate-900">페이지를 찾을 수 없습니다</h1>
      <Link to="/tutors" className="mt-2 text-sm font-medium text-indigo-600 hover:underline">
        과외 선생님 목록으로 돌아가기
      </Link>
    </div>
  )
}
