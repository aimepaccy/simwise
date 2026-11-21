import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { ScrambleText } from '@/components/fx/ScrambleText'

export function NotFound() {
  return (
    <div className="grid min-h-[60dvh] place-items-center px-4 text-center">
      <div>
        <p className="font-display text-6xl font-extrabold text-primary">
          <ScrambleText text="404" stepMs={120} />
        </p>
        <h1 className="mt-4 text-2xl font-bold">Nothing here</h1>
        <p className="mt-2 text-muted-foreground">This page does not exist, or it moved.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/">Back to the dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
