import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { getApiErrorMessage } from '../api/error'
import type { Role } from '../types'

export function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<Role>('STUDENT')
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async () => {
      await authApi.signup({ email, password, name, role, phone: phone || undefined })
      return authApi.login({ email, password })
    },
    onSuccess: (data) => {
      setAuth(data)
      navigate('/tutors', { replace: true })
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">회원가입</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            이름
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            비밀번호 (8자 이상)
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
            전화번호 (선택)
          </label>
          <input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <fieldset>
          <legend className="mb-1 block text-sm font-medium text-gray-700">역할</legend>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="role"
                checked={role === 'STUDENT'}
                onChange={() => setRole('STUDENT')}
              />
              학생
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" name="role" checked={role === 'TUTOR'} onChange={() => setRole('TUTOR')} />
              튜터
            </label>
          </div>
        </fieldset>
        {mutation.isError && (
          <p className="text-sm text-red-600">{getApiErrorMessage(mutation.error, '회원가입에 실패했습니다.')}</p>
        )}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {mutation.isPending ? '가입 중...' : '회원가입'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="text-gray-900 underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
