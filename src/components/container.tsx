import { type ReactNode } from '@tanstack/react-router'

export function Container(props: {
  left?: ReactNode
  right?: ReactNode
  title?: string
}) {
  return (
    <div style={{ padding: '1rem', background: 'orange' }}>
      <h1>{props.title}</h1>
      <div>{props.left}</div>
      <div>{props.right}</div>
    </div>
  )
}
