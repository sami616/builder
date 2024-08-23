import { type ReactNode } from '@tanstack/react-router'

export function Container(props: { children?: ReactNode; title?: string }) {
  return (
    <div style={{ width: '100%', height: 500, background: 'orange' }}>
      <h1>{props.title}</h1>
      {props.children}
    </div>
  )
}
