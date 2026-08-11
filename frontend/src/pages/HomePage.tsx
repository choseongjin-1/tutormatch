import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function HomePage() {
  const user = useAuthStore((state) => state.user)
  return <Navigate to={user ? '/tutors' : '/signup'} replace />
}
