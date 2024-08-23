'use client'

import { type ReactNode } from '@tanstack/react-router'

export function Button({
  children = 'Button',
  icon,
}: {
  children?: ReactNode
  icon: string
}) {
  return (
    <button onClick={() => console.log('click from button')}>
      {icon}
      {children}
    </button>
  )
}
