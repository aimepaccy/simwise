import { useEffect, useRef, useState, type ReactNode } from 'react'
import { animate, motion, useInView, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { cn } from '@/lib/utils'

// Rises into place the first time it scrolls into view.
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: 'spring', stiffness: 140, damping: 22, delay }}
    >
      {children}
    </motion.div>
  )
}

// A thin coral bar across the top of the page that fills as the reader scrolls down.
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })
  return (
    <motion.div
      aria-hidden="true"
      className={cn('fixed inset-x-0 top-0 z-50 h-1 origin-left bg-coral', className)}
      style={{ scaleX }}
    />
  )
}

// Counts up from zero to the value when it scrolls into view.
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? value : 0)

  useEffect(() => {
    if (!inView || reduce) {
      setShown(value)
      return
    }
    const controls = animate(0, value, { duration: 1.1, ease: 'easeOut', onUpdate: (v) => setShown(Math.round(v)) })
    return () => controls.stop()
  }, [inView, reduce, value])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {shown}
    </span>
  )
}
