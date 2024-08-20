'use client'

import { type ReactNode } from '@tanstack/react-router'

function Button({
  children = initialProps.children,
}: {
  children?: ReactNode
}) {
  return (
    <button onClick={() => console.log('click from button')}>{children}</button>
  )
}

const initialProps = { children: 'Button' }

Button.initialProps = {
  children: 'Button',
}

export { Button }
