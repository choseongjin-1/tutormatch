import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tutorsApi } from '../api/tutors'
import { availabilityApi } from '../api/availability'
import { getApiErrorMessage } from '../api/error'
import { Spinner } from '../components/Spinner'
import { cardClass, inputClass, labelClass, primaryButtonClass } from '../styles/ui'
import { SUBJECTS } from '../constants/subjects'

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function TutorProfileFormPage() {
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: ['my-tutor-profile'],
    queryFn: tutorsApi.getMyProfile,
    retry: false,
  })

  const [subject, setSubject] = useState('')
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [career, setCareer] = useState('')

  useEffect(() => {
    if (profileQuery.data) {
      setSubject(profileQuery.data.subject)
      setBio(profileQuery.data.bio ?? '')
      setHourlyRate(String(profileQuery.data.hourlyRate))
      setCareer(profileQuery.data.career ?? '')
    }
  }, [profileQuery.data])

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { subject, bio: bio || undefined, hourlyRate: Number(hourlyRate), career: career || undefined }
      return profileQuery.data ? tutorsApi.updateProfile(payload) : tutorsApi.createProfile(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tutor-profile'] })
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    saveMutation.mutate()
  }

  if (profileQuery.isLoading) {
    return <Spinner />
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">
        {profileQuery.data ? '내 프로필 수정' : '선생님 프로필 등록'}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        {profileQuery.data ? '학생들에게 보여지는 프로필 정보를 수정하세요.' : '학생들에게 나를 소개해보세요.'}
      </p>
      <div className={cardClass}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="subject" className={labelClass}>
              과목
            </label>
            <select
              id="subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                과목을 선택하세요
              </option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="hourlyRate" className={labelClass}>
              시급 (원)
            </label>
            <input
              id="hourlyRate"
              type="number"
              min={0}
              required
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="bio" className={labelClass}>
              소개
            </label>
            <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="career" className={labelClass}>
              경력
            </label>
            <textarea
              id="career"
              rows={3}
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              className={inputClass}
            />
          </div>
          {saveMutation.isError && (
            <p className="text-sm text-red-600">{getApiErrorMessage(saveMutation.error, '저장에 실패했습니다.')}</p>
          )}
          {saveMutation.isSuccess && <p className="text-sm text-emerald-600">저장되었습니다.</p>}
          <button type="submit" disabled={saveMutation.isPending} className={primaryButtonClass}>
            {saveMutation.isPending ? '저장 중...' : profileQuery.data ? '수정하기' : '등록하기'}
          </button>
        </form>
      </div>

      {profileQuery.data && <SlotManager tutorId={profileQuery.data.tutorId} />}
    </div>
  )
}

function SlotManager({ tutorId }: { tutorId: number }) {
  const queryClient = useQueryClient()
  const [slotDate, setSlotDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const today = toIsoDate(new Date())
  const in90Days = toIsoDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))

  const slotsQuery = useQuery({
    queryKey: ['availability', tutorId, today, in90Days],
    queryFn: () => availabilityApi.getByTutor(tutorId, today, in90Days),
  })

  const createSlotMutation = useMutation({
    mutationFn: () => availabilityApi.createSlot(tutorId, { slotDate, startTime, endTime }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', tutorId] })
      setSlotDate('')
      setStartTime('')
      setEndTime('')
    },
  })

  const deleteSlotMutation = useMutation({
    mutationFn: (slotId: number) => availabilityApi.deleteSlot(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', tutorId] })
    },
  })

  const handleAddSlot = (e: FormEvent) => {
    e.preventDefault()
    createSlotMutation.mutate()
  }

  return (
    <div className="mt-8">
      <h2 className="mb-1 text-lg font-bold text-slate-900">예약 가능 시간 관리</h2>
      <p className="mb-4 text-sm text-slate-500">학생들이 예약할 수 있는 시간대를 등록하세요.</p>
      <div className={cardClass}>
        <form onSubmit={handleAddSlot} className="flex flex-wrap items-end gap-3 border-b border-slate-100 pb-6">
          <div>
            <label htmlFor="slotDate" className={labelClass}>
              날짜
            </label>
            <input
              id="slotDate"
              type="date"
              required
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="startTime" className={labelClass}>
              시작 시간
            </label>
            <input
              id="startTime"
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="endTime" className={labelClass}>
              종료 시간
            </label>
            <input
              id="endTime"
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={createSlotMutation.isPending} className={primaryButtonClass}>
            추가
          </button>
        </form>
        {createSlotMutation.isError && (
          <p className="mt-4 text-sm text-red-600">
            {getApiErrorMessage(createSlotMutation.error, '시간 등록에 실패했습니다.')}
          </p>
        )}

        {slotsQuery.data && slotsQuery.data.length === 0 && (
          <p className="pt-6 text-sm text-slate-500">등록된 시간이 없습니다.</p>
        )}
        {slotsQuery.data && slotsQuery.data.length > 0 && (
          <ul className="flex flex-col gap-2 pt-6">
            {slotsQuery.data.map((slot) => (
              <li
                key={slot.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
              >
                <span className="text-slate-700">
                  {slot.slotDate} {slot.startTime.slice(0, 5)}-{slot.endTime.slice(0, 5)}
                  {slot.booked && (
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">예약됨</span>
                  )}
                </span>
                <button
                  type="button"
                  disabled={slot.booked || deleteSlotMutation.isPending}
                  onClick={() => deleteSlotMutation.mutate(slot.id)}
                  className="text-xs font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
