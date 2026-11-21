import { useState, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { FileUp, Info, Mic, ShieldCheck, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/fx/Reveal'
import { ScrambleText } from '@/components/fx/ScrambleText'
import { Surface } from '@/components/fx/Surface'
import { cn } from '@/lib/utils'

const field = 'mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40'

// The form the sim team fills in after a session. Screens only for now: nothing is sent until phase 2.
export function NewDebrief() {
  const [names, setNames] = useState<string[]>([])
  const [draftName, setDraftName] = useState('')
  const [recording, setRecording] = useState(false)

  function addName(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' && event.key !== ',') return
    event.preventDefault()
    const name = draftName.trim()
    if (name && !names.includes(name)) setNames([...names, name])
    setDraftName('')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-extrabold sm:text-4xl">
        New <ScrambleText text="debrief" className="text-primary" />
      </h1>
      <p className="mt-2 text-muted-foreground">Four steps: the session, who took part, the recording, and the material you used.</p>

      <ol className="mt-8 space-y-6">
        <Step n={1} title="The session">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium sm:col-span-2">
              Title
              <input className={field} placeholder="e.g. Septic shock in the emergency bay" />
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Scenario in one or two lines
              <textarea className={cn(field, 'min-h-20')} placeholder="What the team walked into" />
            </label>
            <label className="text-sm font-medium">
              Cohort
              <input className={field} placeholder="e.g. Year 5" />
            </label>
            <label className="text-sm font-medium">
              Date
              <input type="date" className={field} />
            </label>
          </div>
        </Step>

        <Step n={2} title="Who took part">
          <p className="text-sm text-muted-foreground">
            Type each participant's first name and press Enter. SimWise swaps them for "Team member A, B..." before anything reaches the AI, so
            the teaching never names a student.
          </p>
          <div className={cn(field, 'flex min-h-11 flex-wrap items-center gap-2')}>
            {names.map((name, i) => (
              <span key={name} className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-sm text-accent-foreground">
                {name} <span className="text-xs opacity-70">→ Team member {String.fromCharCode(65 + i)}</span>
                <button onClick={() => setNames(names.filter((n) => n !== name))} aria-label={`Remove ${name}`}>
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={addName}
              className="min-w-32 flex-1 bg-transparent outline-none"
              placeholder={names.length ? '' : 'First names'}
              aria-label="Participant first name"
            />
          </div>
        </Step>

        <Step n={3} title="The debrief recording">
          <div className="flex items-start gap-2 rounded-lg bg-warning-soft p-3 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
            <span>Before you start, tell everyone in the room that the debrief is being recorded and that the teaching shared afterwards names no one.</span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <RecordButton recording={recording} onToggle={() => setRecording(!recording)} />
            {/* Surface wraps its children in one inner div, so the column layout goes on our own wrapper. */}
            <Surface tilt={4} className="flex items-center justify-center border-dashed p-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <Upload className="size-6 text-primary" aria-hidden="true" />
                <span className="font-medium">Upload a recording</span>
                <span className="text-xs text-muted-foreground">MP3, M4A, WAV or WebM</span>
              </div>
            </Surface>
          </div>
        </Step>

        <Step n={4} title="Slides, documents and sim cards">
          <Surface tilt={3} className="border-dashed p-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <FileUp className="size-7 text-coral" aria-hidden="true" />
              <span className="font-medium">Drop files here</span>
              <span className="text-xs text-muted-foreground">PowerPoint, PDF, Word, or photos of sim cards. Files are read, then deleted.</span>
            </div>
          </Surface>
        </Step>
      </ol>

      <Reveal className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-success" aria-hidden="true" /> No patient details. Audio is deleted after transcription.
        </span>
        <Button size="lg" disabled className="rounded-full bg-coral text-coral-foreground hover:bg-coral/90" title="Connects to the back end in phase 2">
          Create draft
        </Button>
      </Reveal>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li>
      <Reveal>
        <section className="rounded-xl border bg-card p-5 shadow-soft sm:p-6">
          <h2 className="flex items-center gap-3 text-lg font-bold">
            <span className="grid size-7 place-items-center rounded-full bg-primary text-sm text-primary-foreground">{n}</span>
            {title}
          </h2>
          <div className="mt-4">{children}</div>
        </section>
      </Reveal>
    </li>
  )
}

function RecordButton({ recording, onToggle }: { recording: boolean; onToggle: () => void }) {
  const reduce = useReducedMotion()
  return (
    <button
      onClick={onToggle}
      aria-pressed={recording}
      className="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border bg-card p-6 shadow-soft"
    >
      <span className="relative grid size-16 place-items-center">
        {recording && !reduce && (
          <motion.span
            className="absolute inset-0 rounded-full bg-coral/40"
            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <motion.span
          whileTap={reduce ? undefined : { scale: 0.9 }}
          className={cn('relative grid size-16 place-items-center rounded-full text-coral-foreground', recording ? 'bg-destructive' : 'bg-coral')}
        >
          <Mic className="size-7" aria-hidden="true" />
        </motion.span>
      </span>
      <span className="font-medium">{recording ? 'Recording... tap to stop' : 'Record in the browser'}</span>
      <span className="text-xs text-muted-foreground">{recording ? 'Preview only, nothing is saved yet' : 'Place the phone or laptop near the group'}</span>
    </button>
  )
}
