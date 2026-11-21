import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+<>/'

type Props = {
  text: string
  className?: string
  /** Milliseconds before each letter settles, left to right. */
  stepMs?: number
}

// Letters flicker through random glyphs, then settle one by one into the real word ("decode").
// Runs once, when the text first scrolls into view. Screen readers always get the real text.
export function ScrambleText({ text, className, stepMs = 45 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(text)

  useEffect(() => {
    if (!inView || reduce) {
      setShown(text)
      return
    }
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const settled = Math.floor((now - start) / stepMs)
      setShown(
        [...text]
          .map((char, i) => (char === ' ' || i < settled ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      )
      if (settled < text.length) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, reduce, text, stepMs])

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  )
}
