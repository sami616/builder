import { type Config } from '@repo/editor'
import { ReactNode } from 'react'
import './button.css'

export function Button({ children = 'Button', icon }: { children?: ReactNode; icon: string }) {
  return (
    <button data-component="Button">
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
    slots: {
      icon: { name: 'Icon', validation: { maxItems: 1 } },
    },
    props: [{ id: 'children', name: 'Children', type: 'string', config: { maxLength: 20, minLength: 10 } }],
  },
}
