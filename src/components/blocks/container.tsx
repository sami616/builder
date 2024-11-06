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
      scrollProgress: {
        type: 'boolean',
        name: 'Scroll progress',
        description: 'Show a progress indicator when scrolling',
        default: false,
      },
      opacity: {
        type: 'number',
        description: 'The opacity of the container',
        default: 1,
        name: 'Opacity',
        config: {
          autoComplete: 'off',
          min: 0,
          max: 1,
          step: 0.1,
        },
      },
      paddingObject: {
        type: 'object',
        name: 'Padding',
        description: 'Container padding',
        options: {
          top: {
            name: 'Top',
            type: 'string',
            description: 'Top padding',
            options: [
              { name: 'None', value: '0rem' },
              { name: 'Small', value: '0.5rem' },
              { name: 'Medium', value: '1rem' },
              { name: 'Large', value: '2rem' },
            ],
            default: '0rem',
          },
          right: {
            name: 'Right',
            type: 'string',
            description: 'Right padding',
            options: [
              { name: 'None', value: '0rem' },
              { name: 'Small', value: '0.5rem' },
              { name: 'Medium', value: '1rem' },
              { name: 'Large', value: '2rem' },
            ],
            default: '0rem',
          },
          bottom: {
            name: 'Bottom',
            type: 'string',
            description: 'Bottom padding',
            options: [
              { name: 'None', value: '0rem' },
              { name: 'Small', value: '0.5rem' },
              { name: 'Medium', value: '1rem' },
              { name: 'Large', value: '2rem' },
            ],
            default: '0rem',
          },
          left: {
            name: 'Left',
            type: 'string',
            options: [
              { name: 'None', value: '0rem' },
              { name: 'Small', value: '0.5rem' },
              { name: 'Medium', value: '1rem' },
              { name: 'Large', value: '2rem' },
            ],
            default: '0rem',
          },
        },
      },
      padding: {
        name: 'Padding',
        default: '1rem',
        type: 'string',
        description: 'Left padding',
        options: [
          { name: 'Small', value: '1rem' },
          { name: 'Medium', value: '2rem' },
          { name: 'Large', value: '3rem' },
        ],
      },
    },
  },
}
