import { type ReactNode } from '@tanstack/react-router'
import { type Config } from '@/main'

export function Container(props: { padding?: string; left?: ReactNode; right?: ReactNode; background: string; title?: string }) {
  return (
    <div style={{ padding: props.padding, background: props.background }}>
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
      title: { name: 'Title', default: 'Container Title', type: 'string' },
      background: {
        name: 'Background',
        description: 'Container background color',
        default: 'white',
        type: 'string',
        options: [
          { name: 'White', value: 'white' },
          { name: 'Light gray', value: '#efefefef' },
          { name: 'Green', value: '#007f00' },
        ],
      },

      padding: {
        name: 'Padding',
        default: '1rem',
        type: 'string',
        options: [
          { name: 'Small', value: '1rem' },
          { name: 'Medium', value: '2rem' },
          { name: 'Large', value: '3rem' },
        ],
      },
    },
  },
}
