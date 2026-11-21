// Shown for the moment a page's code is still downloading. The dots only pulse when motion is allowed.
export function PageLoader() {
  return (
    <div role="status" className="grid min-h-[60dvh] place-items-center">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-primary motion-safe:animate-pulse" />
        <span className="size-2.5 rounded-full bg-primary motion-safe:animate-pulse [animation-delay:150ms]" />
        <span className="size-2.5 rounded-full bg-coral motion-safe:animate-pulse [animation-delay:300ms]" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  )
}
