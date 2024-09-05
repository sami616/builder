import { type ReactNode } from '@tanstack/react-router'

export function Container(props: { left?: ReactNode; right?: ReactNode; title?: string }) {
  return (
    <div style={{ padding: '1rem', background: '#efefef' }}>
      <h1>{props.title}</h1>
      <div>{props.left}</div>
      <div>{props.right}</div>
    </div>
  )
}

export const containerConfig = {
  Container: {
    component: Container,
    name: 'Container',
    slots: {
      left: { default: [], name: 'Left' },
      right: { default: [], name: 'Right' },
    },
    props: {
      title: { default: 'Container Title', type: 'string' },
    },
  },
}
