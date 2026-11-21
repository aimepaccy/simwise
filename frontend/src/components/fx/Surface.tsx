import { useRef, type ComponentProps } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'

type Props = ComponentProps<typeof motion.div> & {
  /** Largest tilt in degrees. */
  tilt?: number
}

const springy = { stiffness: 260, damping: 22 }

// A "touchable" card: it leans towards a mouse pointer, a soft light follows the pointer across it,
// and it presses in when tapped (which is what touch screens get, since they have no hover).
export function Surface({ className, children, tilt = 6, ...props }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  // Pointer position across the card, 0 to 1 on each axis; 0.5 is the centre.
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [tilt, -tilt]), springy)
  const rotateY = useSpring(useTransform(px, [0, 1], [-tilt, tilt]), springy)
  const glow = useTransform(
    [px, py],
    ([x, y]: number[]) =>
      `radial-gradient(22rem circle at ${x * 100}% ${y * 100}%, color-mix(in oklch, var(--primary) 16%, transparent), transparent 60%)`,
  )

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== 'mouse' || !ref.current) return
    const box = ref.current.getBoundingClientRect()
    px.set((event.clientX - box.left) / box.width)
    py.set((event.clientY - box.top) / box.height)
  }

  function onPointerLeave() {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      className={cn('group relative overflow-hidden rounded-xl border bg-card shadow-soft', className)}
      {...props}
    >
      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glow }}
        />
      )}
      <div className="relative">{children as React.ReactNode}</div>
    </motion.div>
  )
}
