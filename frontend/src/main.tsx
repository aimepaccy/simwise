import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import { AppShell } from '@/components/AppShell'
import { Dashboard } from '@/pages/Dashboard'
import { NewDebrief } from '@/pages/NewDebrief'
import { SessionReview } from '@/pages/SessionReview'
import { SharedOutput } from '@/pages/SharedOutput'
import { NotFound } from '@/pages/NotFound'

// Two halves: the sim team side (inside AppShell) and the public student page at /s/<token>.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="new" element={<NewDebrief />} />
          <Route path="sessions/:id" element={<SessionReview />} />
        </Route>
        <Route path="s/:token" element={<SharedOutput />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
