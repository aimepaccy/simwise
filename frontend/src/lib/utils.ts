import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Joins class names and lets later Tailwind classes override earlier ones.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// "18 Nov" from "2026-11-18". Noon avoids the date slipping a day across time zones.
export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
