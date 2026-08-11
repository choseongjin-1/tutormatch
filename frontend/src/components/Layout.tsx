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
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/tutors" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              과
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">과외매칭</span>
          </Link>
          <div className="flex items-center gap-1 text-sm sm:gap-2">
            <Link
              to="/tutors"
              className="rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              과외 찾기
            </Link>
            {user ? (
              <>
                {user.role === 'TUTOR' && (
                  <Link
                    to="/tutor/profile"
                    className="rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    프로필·시간 관리
                  </Link>
                )}
                <Link
                  to="/reservations"
                  className="rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  내 예약
                </Link>
                <span className="hidden px-2 text-slate-400 sm:inline">{user.name}님</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md bg-indigo-600 px-3.5 py-2 font-medium text-white shadow-sm hover:bg-indigo-500"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
