import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { ROUTES } from './routePaths'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import SearchPage from '@/pages/SearchPage'
import SetDetailPage from '@/pages/SetDetailPage'
import PieceDetailPage from '@/pages/PieceDetailPage'
import DashboardPage from '@/pages/DashboardPage'
import ProjectDetailPage from '@/pages/ProjectDetailPage'
import NewProjectPage from '@/pages/NewProjectPage'
import IdentifyPage from '@/pages/IdentifyPage'
import CommunityPage from '@/pages/CommunityPage'
import CommunityDetailPage from '@/pages/CommunityDetailPage'
import NewMocPage from '@/pages/NewMocPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.SEARCH, element: <SearchPage /> },
      { path: ROUTES.SET_DETAIL, element: <SetDetailPage /> },
      { path: ROUTES.PIECE_DETAIL, element: <PieceDetailPage /> },
      { path: ROUTES.COMMUNITY, element: <CommunityPage /> },
      { path: ROUTES.COMMUNITY_DETAIL, element: <CommunityDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.NEW_PROJECT, element: <NewProjectPage /> },
          { path: ROUTES.PROJECT_DETAIL, element: <ProjectDetailPage /> },
          { path: ROUTES.IDENTIFY, element: <IdentifyPage /> },
          { path: ROUTES.NEW_MOC, element: <NewMocPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
