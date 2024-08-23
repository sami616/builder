import { type ReactNode } from '@tanstack/react-router'

export function Heading({ children = 'Heading' }: { children?: ReactNode }) {
  return <h1 style={{ margin: 0, padding: 0 }}>{children}</h1>
}
