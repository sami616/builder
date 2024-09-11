'use client'

import { type ReactNode } from '@tanstack/react-router'
import { type Config } from '../main'

export function Button({ children = 'Button', icon }: { children?: ReactNode; icon: string }) {
  return (
    <button onClick={() => console.log('click from button')}>
      {icon}
      {children}
    </button>
  )
}

export const buttonConfig: Config = {
  Button: {
    component: Button,
    name: 'Button',
    folder: ['UI', 'Elements'],
    slots: {},
    props: {
      children: { default: 'Button', type: 'string' },
      icon: { default: undefined, type: 'string' },
    },
  },
}
