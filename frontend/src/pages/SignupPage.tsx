import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { getApiErrorMessage } from '../api/error'
import { cardClass, inputClass, labelClass, primaryButtonClass } from '../styles/ui'
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
      <h1 className="mb-1 text-2xl font-bold text-slate-900">과외매칭 시작하기</h1>
      <p className="mb-6 text-sm text-slate-500">몇 가지 정보만 입력하면 바로 시작할 수 있어요.</p>
      <div className={cardClass}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <fieldset>
            <legend className={labelClass}>가입 유형</legend>
            <div className="grid grid-cols-2 gap-3">
              <RoleOption
                label="학생이에요"
                description="과외 선생님을 찾아요"
                selected={role === 'STUDENT'}
                onSelect={() => setRole('STUDENT')}
              />
              <RoleOption
                label="선생님이에요"
                description="학생을 가르쳐요"
                selected={role === 'TUTOR'}
                onSelect={() => setRole('TUTOR')}
              />
            </div>
          </fieldset>
          <div>
            <label htmlFor="name" className={labelClass}>
              이름
            </label>
            <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
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
              비밀번호 (8자 이상)
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              전화번호 (선택)
            </label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>
          {mutation.isError && (
            <p className="text-sm text-red-600">{getApiErrorMessage(mutation.error, '회원가입에 실패했습니다.')}</p>
          )}
          <button type="submit" disabled={mutation.isPending} className={primaryButtonClass}>
            {mutation.isPending ? '가입 중...' : '회원가입'}
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-sm text-slate-600">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}

function RoleOption({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string
  description: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-lg border px-3 py-2.5 text-left transition ${
        selected
          ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
          : 'border-slate-300 hover:border-slate-400'
      }`}
    >
      <p className={`text-sm font-semibold ${selected ? 'text-indigo-700' : 'text-slate-900'}`}>{label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
    </button>
  )
}
