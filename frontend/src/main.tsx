import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import { AppShell } from '@/components/AppShell'
import { PageLoader } from '@/components/PageLoader'

// Each page is its own download, fetched when first visited, so a student opening a share link
// never loads the sim team pages (and the reverse).
const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const NewDebrief = lazy(() => import('@/pages/NewDebrief').then((m) => ({ default: m.NewDebrief })))
const SessionReview = lazy(() => import('@/pages/SessionReview').then((m) => ({ default: m.SessionReview })))
const SharedOutput = lazy(() => import('@/pages/SharedOutput').then((m) => ({ default: m.SharedOutput })))
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))

// Two halves: the sim team side (inside AppShell) and the public student page at /s/<token>.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="new" element={<NewDebrief />} />
            <Route path="sessions/:id" element={<SessionReview />} />
          </Route>
          <Route path="s/:token" element={<SharedOutput />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
