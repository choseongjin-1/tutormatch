import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { getApiErrorMessage } from '../api/error'
import { cardClass, inputClass, labelClass, primaryButtonClass } from '../styles/ui'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()
  const location = useLocation()

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data)
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/tutors'
      navigate(redirectTo, { replace: true })
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutation.mutate({ email, password })
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">다시 만나서 반가워요</h1>
      <p className="mb-6 text-sm text-slate-500">과외매칭에 로그인하세요.</p>
      <div className={cardClass}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className={labelClass}>
              이메일
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          {mutation.isError && (
            <p className="text-sm text-red-600">{getApiErrorMessage(mutation.error, '로그인에 실패했습니다.')}</p>
          )}
          <button type="submit" disabled={mutation.isPending} className={primaryButtonClass}>
            {mutation.isPending ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-sm text-slate-600">
        아직 계정이 없으신가요?{' '}
        <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  )
}
