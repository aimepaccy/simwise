import { Suspense } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { Moon, Plus, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/PageLoader'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-display text-lg font-bold', className)}>
      <img src="/favicon.svg" alt="" className="size-7" />
      SimWise
    </span>
  )
}

export function ThemeToggle() {
  const { theme, chooseTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <Button variant="ghost" size="icon" onClick={() => chooseTheme(next)} aria-label={`Switch to ${next} theme`}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}

// The sim team side: a top bar with the main places, and the page below it.
export function AppShell() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn('rounded-full px-3 py-1.5 text-sm font-medium transition-colors', isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground')

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link to="/" aria-label="SimWise dashboard">
            <Logo />
          </Link>
          <nav className="ml-2 hidden items-center gap-1 sm:flex">
            <NavLink to="/" end className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/new" className={navClass}>
              New debrief
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button asChild className="rounded-full bg-coral text-coral-foreground hover:bg-coral/90 sm:hidden" size="icon" aria-label="New debrief">
              <Link to="/new">
                <Plus />
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main>
        {/* Its own Suspense, so the top bar stays put while the next page loads. */}
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
