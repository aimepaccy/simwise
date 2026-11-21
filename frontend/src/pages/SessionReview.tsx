import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Copy, ExternalLink, FileText, Image, Link2, LoaderCircle, Presentation, Send, ShieldCheck, Check } from 'lucide-react'
import { findSession } from '@/data/sample'
import type { DebriefSession, DocumentItem } from '@/types'
import { StatusBadge } from '@/components/StatusBadge'
import { TeachingView } from '@/components/TeachingView'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/fx/Reveal'
import { NotFound } from '@/pages/NotFound'
import { formatDate } from '@/pages/Dashboard'

const docIcon: Record<DocumentItem['kind'], typeof FileText> = { pptx: Presentation, pdf: FileText, docx: FileText, photo: Image }

// One debrief from the sim team's side: check the draft, edit it, publish it.
export function SessionReview() {
  const { id = '' } = useParams()
  const session = findSession(id)
  if (!session) return <NotFound />

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Dashboard
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <StatusBadge status={session.status} />
        <span className="text-sm text-muted-foreground">
          {formatDate(session.date)} · {session.cohort} · {session.durationMin} min · {session.participants} in the team
        </span>
      </div>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{session.title}</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">{session.scenario}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_19rem]">
        <div>
          {session.status === 'processing' ? (
            <Processing />
          ) : session.output ? (
            <TeachingView output={session.output} editable />
          ) : (
            <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">This sample session has no teaching written out. Open the sepsis or anaphylaxis debrief to see one.</p>
          )}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {session.status !== 'processing' && <PublishCard session={session} />}
          <Reveal>
            <div className="rounded-xl border bg-card p-5 shadow-soft">
              <h2 className="font-bold">Inputs</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-success" aria-hidden="true" />
                  Debrief recording, {session.durationMin} min (audio deleted)
                </li>
                {session.documents.map((d) => {
                  const Icon = docIcon[d.kind]
                  return (
                    <li key={d.name} className="flex items-center gap-2">
                      <Icon className="size-4 text-primary" aria-hidden="true" />
                      {d.name}
                    </li>
                  )
                })}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">{session.participants} names were replaced with "Team member A, B..." before the AI read anything.</p>
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  )
}

function Processing() {
  const steps = ['Transcribing the debrief', 'Reading slides and sim cards', 'Taking out names', 'Writing the teaching draft']
  return (
    <div className="rounded-xl border bg-card p-6 shadow-soft">
      <h2 className="text-lg font-bold">SimWise is working on this debrief</h2>
      <ol className="mt-5 space-y-3">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-3 text-sm">
            {i < 2 ? (
              <Check className="size-5 text-success" aria-hidden="true" />
            ) : i === 2 ? (
              <LoaderCircle className="size-5 animate-spin text-warning" aria-hidden="true" />
            ) : (
              <span className="size-5 rounded-full border-2" aria-hidden="true" />
            )}
            <span className={i > 2 ? 'text-muted-foreground' : ''}>{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-xs text-muted-foreground">Sample screen. The real progress comes from the back end in phase 3.</p>
    </div>
  )
}

function PublishCard({ session }: { session: DebriefSession }) {
  const [published, setPublished] = useState(session.status === 'published')
  const [copied, setCopied] = useState(false)
  const token = session.shareToken ?? 'preview-token-only'
  const link = `${window.location.origin}/s/${token}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard can be blocked; the link is still visible to copy by hand.
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-soft">
      <AnimatePresence mode="wait" initial={false}>
        {published ? (
          <motion.div key="shared" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-5">
            <h2 className="flex items-center gap-2 font-bold">
              <Link2 className="size-4 text-primary" aria-hidden="true" /> Shared with students
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Anyone with this link can read the teaching. Paste it into Canvas.</p>
            <div className="mt-3 truncate rounded-lg bg-muted px-3 py-2 font-mono text-xs">{link}</div>
            <div className="mt-3 flex gap-2">
              <Button onClick={copy} size="sm" className="flex-1">
                {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy link'}
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to={`/s/${token}`} target="_blank">
                  <ExternalLink /> Open
                </Link>
              </Button>
            </div>
            <button onClick={() => setPublished(false)} className="mt-3 text-xs text-destructive hover:underline">
              Switch the link off
            </button>
          </motion.div>
        ) : (
          <motion.div key="draft" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-5">
            <h2 className="font-bold">Ready to share?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Check each section and edit anything that is wrong. Students see it only after you publish.</p>
            <Button onClick={() => setPublished(true)} className="mt-4 w-full rounded-full bg-coral text-coral-foreground hover:bg-coral/90">
              <Send /> Publish
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
