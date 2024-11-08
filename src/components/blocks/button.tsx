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
    slots: {
      icon: { name: 'Icon', validation: { maxItems: 1 } },
    },
    props: [{ id: 'children', name: 'Children', type: 'string', config: { maxLength: 20, minLength: 10 } }],
  },
}
