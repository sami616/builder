'use client'

import { type ReactNode } from '@tanstack/react-router'
import { type Config } from '@/main'
import { Button as ShadButton } from '@/components/ui/button'

export function Button({ children = 'Button', icon }: { children?: ReactNode; icon: string }) {
  return (
    <ShadButton>
      {icon}
      {children}
    </ShadButton>
  )
}

export const buttonConfig: Config = {
  Button: {
    component: Button,
    name: 'Button',
    folder: ['Elements'],
    props: {
      children: { name: 'Children', type: 'string' },
      icon: { name: 'Icon', default: undefined, type: 'string' },
    },
  },
}
