import { type ReactNode } from '@tanstack/react-router'
import { type Config } from '@/main'

export function Container(props: { left?: ReactNode; right?: ReactNode; title?: string }) {
  return (
    <div style={{ padding: '1rem', background: '#efefef' }}>
      <p>{props.title}</p>
      <div className="grid grid-cols-2">
        <div>{props.left}</div>
        <div>{props.right}</div>
      </div>
    </div>
  )
}

export const containerConfig: Config = {
  Container: {
    component: Container,
    name: 'Container',
    // folder: ['UI', 'Elements', 'Layout'],
    slots: {
      left: { default: [], name: 'Left', validation: { maxItems: 2, disabledComponents: ['Button'] } },
      right: { default: [], name: 'Right' },
    },
    props: {
      title: { name: 'Title', default: 'Container Title', type: 'text' },
    },
  },
}
