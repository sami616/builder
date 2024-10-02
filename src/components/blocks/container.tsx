import { type ReactNode } from '@tanstack/react-router'
import { type Config } from '@/main'

export function Container(props: { left?: ReactNode; right?: ReactNode; title?: string }) {
  return (
    <div style={{ padding: '1rem', background: '#efefef' }}>
      <p>{props.title}</p>
      <div>{props.left}</div>
      <div>{props.right}</div>
    </div>
  )
}

export const containerConfig: Config = {
  Container: {
    component: Container,
    name: 'Container',
    // folder: ['UI', 'Elements', 'Layout'],
    slots: {
      left: { default: [], name: 'Left' },
      right: { default: [], name: 'Right' },
    },
    props: {
      title: { name: 'Title', default: 'Container Title', type: 'string' },
    },
  },
}
