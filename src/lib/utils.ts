import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function flash(element: Element) {
  element.animate([{ backgroundColor: 'rgb(244 63 94)' }, {}], {
    duration: 800,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
    iterations: 1,
  })
}
