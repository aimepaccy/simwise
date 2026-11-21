import { useState } from 'react'
import { BookOpen, Check, Lightbulb, PencilLine, Quote, Target, ThumbsUp, TrendingUp } from 'lucide-react'
import type { Point, TeachingOutput } from '@/types'
import { Reveal } from '@/components/fx/Reveal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type Props = {
  output: TeachingOutput
  /** The facilitator's copy can be edited; the students' copy cannot. */
  editable?: boolean
}

// The teaching output, section by section, each sliding in as it scrolls into view.
export function TeachingView({ output, editable = false }: Props) {
  return (
    <div className="space-y-6">
      <Section icon={BookOpen} title="What the scenario was about" editable={editable} text={output.overview}>
        <p className="leading-relaxed">{output.overview}</p>
      </Section>

      <Section icon={Target} title="Learning objectives" editable={editable} text={output.objectives.join('\n')}>
        <ul className="space-y-2">
          {output.objectives.map((o) => (
            <li key={o} className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {o}
            </li>
          ))}
        </ul>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <PointsSection icon={ThumbsUp} title="What went well" points={output.wentWell} tone="success" editable={editable} />
        <PointsSection icon={TrendingUp} title="What to improve" points={output.improve} tone="coral" editable={editable} />
      </div>

      <PointsSection icon={Lightbulb} title="Key teaching points" points={output.teachingPoints} tone="primary" editable={editable} />
    </div>
  )
}

const tones = {
  success: 'bg-success-soft text-success',
  coral: 'bg-coral-soft text-coral',
  primary: 'bg-accent text-primary',
}

function Section({
  icon: Icon,
  title,
  text,
  editable,
  tone = 'primary',
  children,
}: {
  icon: typeof BookOpen
  title: string
  text: string
  editable: boolean
  tone?: keyof typeof tones
  children: React.ReactNode
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(text)

  return (
    <Reveal>
      <section className="h-full rounded-xl border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex items-center gap-3">
          <span className={cn('grid size-9 place-items-center rounded-lg', tones[tone])}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold">{title}</h2>
          {editable && (
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setEditing(!editing)}>
              {editing ? <Check /> : <PencilLine />}
              {editing ? 'Done' : 'Edit'}
            </Button>
          )}
        </div>
        <div className="mt-4">
          {editing ? <Textarea value={value} onChange={(e) => setValue(e.target.value)} className="min-h-32" aria-label={`Edit ${title}`} /> : children}
        </div>
      </section>
    </Reveal>
  )
}

function PointsSection({
  icon,
  title,
  points,
  tone,
  editable,
}: {
  icon: typeof BookOpen
  title: string
  points: Point[]
  tone: keyof typeof tones
  editable: boolean
}) {
  return (
    <Section icon={icon} title={title} tone={tone} editable={editable} text={points.map((p) => p.text).join('\n\n')}>
      <ul className="space-y-4">
        {points.map((p) => (
          <li key={p.text}>
            <p className="leading-relaxed">{p.text}</p>
            <figure className="mt-2 flex gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Quote className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <div>
                <blockquote className="italic">{p.quote}</blockquote>
                <figcaption className="mt-1 text-xs not-italic">From the {p.source}</figcaption>
              </div>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  )
}
