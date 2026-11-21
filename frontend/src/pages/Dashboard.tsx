import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, CalendarDays, FileText, Mic, Plus, Users } from 'lucide-react'
import { sessions, recurringThemes } from '@/data/sample'
import type { DebriefSession, SessionStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'
import { ScrambleText } from '@/components/fx/ScrambleText'
import { Surface } from '@/components/fx/Surface'
import { CountUp, Reveal } from '@/components/fx/Reveal'
import { cn, formatDate } from '@/lib/utils'

const filters: { value: SessionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'processing', label: 'Processing' },
  { value: 'draft', label: 'Drafts' },
  { value: 'published', label: 'Published' },
]

export function Dashboard() {
  const [filter, setFilter] = useState<SessionStatus | 'all'>('all')
  const shown = useMemo(() => (filter === 'all' ? sessions : sessions.filter((s) => s.status === filter)), [filter])
  const stats = [
    { label: 'Debriefs recorded', value: sessions.length, icon: Mic },
    { label: 'Waiting for review', value: sessions.filter((s) => s.status === 'draft').length, icon: FileText },
    { label: 'Shared with students', value: sessions.filter((s) => s.status === 'published').length, icon: Users },
    { label: 'Minutes of debrief', value: sessions.reduce((n, s) => n + s.durationMin, 0), icon: CalendarDays },
  ]

  return (
    <>
      <Hero />
      <div className="mx-auto -mt-10 max-w-6xl px-4 pb-20">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.06}>
              <Surface className="p-4 sm:p-5">
                <stat.icon className="size-5 text-primary" aria-hidden="true" />
                <div className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                  <CountUp value={stat.value} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </Surface>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <section aria-labelledby="sessions-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="sessions-heading" className="text-xl font-bold">
                Debriefs
              </h2>
              <div className="flex gap-1 rounded-full bg-muted p-1" role="tablist" aria-label="Filter by status">
                {filters.map((f) => (
                  <button
                    key={f.value}
                    role="tab"
                    aria-selected={filter === f.value}
                    onClick={() => setFilter(f.value)}
                    className={cn(
                      'relative rounded-full px-3 py-1 text-sm font-medium transition-colors',
                      filter === f.value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {filter === f.value && (
                      <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-card shadow-soft" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                    )}
                    <span className="relative">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {shown.map((s, i) => (
                <Reveal key={s.id} delay={(i % 2) * 0.06}>
                  <SessionCard session={s} />
                </Reveal>
              ))}
              {shown.length === 0 && <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
            </div>
          </section>

          <aside>
            <Reveal>
              <ThemesPanel />
            </Reveal>
          </aside>
        </div>
      </div>
    </>
  )
}

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // The text drifts up and fades a little as the page scrolls: a gentle parallax.
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.2])

  return (
    <section ref={ref} className="hero-band relative overflow-hidden text-hero-foreground">
      <motion.div style={{ y, opacity }} className="mx-auto max-w-6xl px-4 pt-12 pb-20 sm:pt-16 sm:pb-24">
        <p className="text-sm font-medium tracking-wide uppercase opacity-80">Sim team</p>
        <h1 className="mt-2 max-w-2xl text-3xl leading-tight font-extrabold sm:text-5xl">
          From debrief to <ScrambleText text="teaching" className="text-hero-accent" />, for the whole cohort.
        </h1>
        <p className="mt-4 max-w-xl text-base opacity-90 sm:text-lg">
          Record the debrief, add the slides and sim cards. SimWise drafts the teaching; you check it and share one link.
        </p>
        <Button asChild size="lg" className="mt-6 rounded-full bg-coral text-coral-foreground shadow-lg hover:bg-coral/90">
          <Link to="/new">
            <Plus /> New debrief
          </Link>
        </Button>
      </motion.div>
    </section>
  )
}

function SessionCard({ session: s }: { session: DebriefSession }) {
  return (
    <Link to={`/sessions/${s.id}`} className="block rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
      <Surface className="h-full p-5">
        <div className="flex items-start justify-between gap-3">
          <StatusBadge status={s.status} />
          <span className="text-xs text-muted-foreground">
            {formatDate(s.date)} · {s.cohort}
          </span>
        </div>
        <h3 className="mt-3 text-lg leading-snug font-bold">{s.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.scenario}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {s.durationMin} min · {s.participants} in the team · {s.documents.length} {s.documents.length === 1 ? 'file' : 'files'}
          </span>
          <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </div>
      </Surface>
    </Link>
  )
}

// Which themes keep coming up across debriefs: one bar per theme, longest first.
function ThemesPanel() {
  const { total, themes } = recurringThemes(sessions)
  return (
    <Surface tilt={3} className="p-5">
      <h2 className="text-lg font-bold">Recurring themes</h2>
      <p className="mt-1 text-sm text-muted-foreground">What debriefs keep coming back to, across {total} sessions.</p>
      <ul className="mt-5 space-y-4">
        {themes.map((t, i) => (
          <li key={t.name} title={`${t.name}: ${t.count} of ${total} sessions`}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium">{t.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {t.count} of {total}
              </span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                whileInView={{ width: `${(t.count / total) * 100}%` }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 90, damping: 20, delay: i * 0.08 }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Surface>
  )
}
