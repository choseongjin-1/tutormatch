import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function Layout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/tutors" className="text-lg font-semibold text-gray-900">
            TutorMatch
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/tutors" className="text-gray-600 hover:text-gray-900">
              튜터 찾기
            </Link>
            {user ? (
              <>
                {user.role === 'TUTOR' && (
                  <Link to="/tutor/profile" className="text-gray-600 hover:text-gray-900">
                    내 프로필/시간
                  </Link>
                )}
                <Link to="/reservations" className="text-gray-600 hover:text-gray-900">
                  내 예약
                </Link>
                <span className="text-gray-400">{user.name}님</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-700"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
