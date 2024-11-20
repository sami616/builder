import { clsx, type ClassValue } from 'clsx'
import { io } from 'socket.io-client'
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

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000'
export const socket = io(URL)
