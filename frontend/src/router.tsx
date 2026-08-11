import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { TutorListPage } from './pages/TutorListPage'
import { TutorDetailPage } from './pages/TutorDetailPage'
import { TutorProfileFormPage } from './pages/TutorProfileFormPage'
import { MyReservationsPage } from './pages/MyReservationsPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'tutors', element: <TutorListPage /> },
      { path: 'tutors/:tutorId', element: <TutorDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: 'reservations', element: <MyReservationsPage /> }],
      },
      {
        element: <ProtectedRoute allowedRoles={['TUTOR']} />,
        children: [{ path: 'tutor/profile', element: <TutorProfileFormPage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
