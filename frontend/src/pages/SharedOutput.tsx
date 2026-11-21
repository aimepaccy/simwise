import { useParams } from 'react-router'
import { ExternalLink, MessageCircle, Sparkles, Users } from 'lucide-react'
import { findByToken } from '@/data/sample'
import { TeachingView } from '@/components/TeachingView'
import { Logo, ThemeToggle } from '@/components/AppShell'
import { Reveal, ScrollProgress } from '@/components/fx/Reveal'
import { ScrambleText } from '@/components/fx/ScrambleText'
import { Surface } from '@/components/fx/Surface'
import { formatDate } from '@/lib/utils'

// The page students open from the share link. No login, no sim team controls, read only.
export function SharedOutput() {
  const { token = '' } = useParams()
  const session = findByToken(token)

  if (!session?.output) {
    return (
      <div className="grid min-h-dvh place-items-center px-4 text-center">
        <div>
          <Logo className="justify-center" />
          <h1 className="mt-6 text-2xl font-bold">This link is not active</h1>
          <p className="mt-2 text-muted-foreground">It may have been switched off by the sim team. Ask them for a new one.</p>
        </div>
      </div>
    )
  }
  const { output } = session

  return (
    <div className="min-h-dvh">
      <ScrollProgress />
      <header className="hero-band text-hero-foreground">
        <div className="mx-auto flex max-w-4xl items-center px-4 pt-5">
          <Logo />
          <div className="ml-auto [&_button]:text-hero-foreground [&_button:hover]:bg-white/10">
            <ThemeToggle />
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 pt-10 pb-16 sm:pt-14 sm:pb-20">
          <p className="text-sm font-medium tracking-wide uppercase opacity-80">
            Simulation debrief · {formatDate(session.date)} · {session.cohort}
          </p>
          <h1 className="mt-2 text-3xl leading-tight font-extrabold sm:text-5xl">
            <ScrambleText text={session.title} stepMs={28} />
          </h1>
          <p className="mt-4 max-w-2xl text-base opacity-90 sm:text-lg">{session.scenario}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1">
              <Users className="size-3.5" aria-hidden="true" /> Team-level teaching, no names
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1">
              <Sparkles className="size-3.5" aria-hidden="true" /> AI-assisted, checked by the facilitator
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-8 max-w-4xl px-4 pb-24">
        <TeachingView output={output} />

        <Reveal className="mt-10">
          <h2 className="text-xl font-bold">Further reading</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {output.reading.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="block rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                <Surface className="h-full p-4">
                  <span className="text-xs font-medium text-coral">{r.site}</span>
                  <p className="mt-1 font-medium">{r.title}</p>
                  <ExternalLink className="mt-3 size-4 text-muted-foreground" aria-hidden="true" />
                </Surface>
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <div className="flex items-center gap-4 rounded-xl border border-dashed p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-coral-soft text-coral">
              <MessageCircle className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-bold">Ask about this debrief</h2>
              <p className="text-sm text-muted-foreground">Questions answered from this session's material only. Coming in phase 5.</p>
            </div>
          </div>
        </Reveal>
      </main>
    </div>
  )
}
