'use client'

import { type ReactNode } from '@tanstack/react-router'

function Button({
  children = initialProps.children,
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

const initialProps = { children: 'Button' }

Button.initialProps = {
  children: 'Button',
}

export { Button }
