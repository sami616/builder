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
      right: { default: [], name: 'Left', validation: { maxItems: 2, disabledComponents: ['Button'] } },
    },
    props: [
      {
        id: 'title',
        name: 'Title',
        default: 'Container Title',
        type: 'string',
        config: {
          required: true,
        },
        hidden: {
          operator: '&&',
          rules: [['scrollProgress', '===', true]],
        },
      },
      {
        id: 'background',
        name: 'Background',
        description: 'Container background color',
        config: {},
        type: 'colour',
        options: {
          solid: [{ value: '#ffffff' }, { value: '#efefefef' }, { name: 'green', value: '#007f00' }],
        },
      },
      {
        id: 'scrollProgress',
        type: 'boolean',
        name: 'Scroll progress',
        description: 'Show a progress indicator when scrolling',
        default: false,
      },
      {
        id: 'opacity',
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
      {
        id: 'layout',
        type: 'collapsible',
        name: 'Layout',
        config: {
          defaultOpen: false,
        },
        description: 'Container layout options',
        props: [
          {
            type: 'grid',
            cols: 2,
            name: 'My group',
            description: 'My group',
            id: 'my-cols',
            hidden: { operator: '&&', rules: [['scrollProgress', '===', true]] },
            props: [
              {
                type: 'string',
                name: 'Width',
                id: 'width',
                default: '100%',
                description: 'Width',
                options: [
                  { name: 'Full', value: '100%' },
                  { name: 'Half', value: '50%' },
                  { name: 'Quarter', value: '25%' },
                ],
              },
              {
                type: 'string',
                name: 'Height',
                id: 'height',
                default: '100%',
                description: 'Height',
                options: [
                  { name: 'Full', value: '100%' },
                  { name: 'Half', value: '50%' },
                  { name: 'Quarter', value: '25%' },
                ],
              },
            ],
          },
          {
            name: 'Padding',
            id: 'padding',
            default: '0rem',
            type: 'string',
            description: 'Padding',
            options: [
              { name: 'None', value: '0rem' },
              { name: 'Small', value: '1rem' },
              { name: 'Medium', value: '2rem' },
              { name: 'Large', value: '3rem' },
            ],
          },
          {
            name: 'Margin',
            id: 'margin',
            default: '0rem',
            type: 'string',
            description: 'Padding',
            hidden: {
              operator: '&&',
              rules: [['scrollProgress', '===', true]],
            },
            options: [
              { name: 'None', value: '0rem' },
              { name: 'Small', value: '1rem' },
              { name: 'Medium', value: '2rem' },
              { name: 'Large', value: '3rem' },
            ],
          },
          {
            name: 'Nested group',
            type: 'collapsible',
            config: {
              defaultOpen: true,
            },
            id: 'nestedGroup',
            props: [{ type: 'string', id: 'nestedField', name: 'Nested field', default: 'Nested value' }],
          },
        ],
      },
    ],
  },
}
