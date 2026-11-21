import { CheckCircle2, LoaderCircle, PencilLine } from 'lucide-react'
import type { SessionStatus } from '@/types'
import { cn } from '@/lib/utils'

const look: Record<SessionStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  processing: { label: 'Processing', icon: LoaderCircle, className: 'bg-warning-soft text-foreground [&_svg]:text-warning [&_svg]:animate-spin' },
  draft: { label: 'Draft', icon: PencilLine, className: 'bg-coral-soft text-foreground [&_svg]:text-coral' },
  published: { label: 'Published', icon: CheckCircle2, className: 'bg-success-soft text-foreground [&_svg]:text-success' },
}

// State is shown by an icon and a word, never by colour alone.
export function StatusBadge({ status, className }: { status: SessionStatus; className?: string }) {
  const { label, icon: Icon, className: tone } = look[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', tone, className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}
