'use client'

import { type ReactNode } from '@tanstack/react-router'
import { type Config } from '@/main'

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
    folder: ['Elements'],
    slots: {},
    props: {
      children: { name: 'Children', type: 'string' },
      icon: { name: 'Icon', default: undefined, type: 'string' },
    },
  },
}