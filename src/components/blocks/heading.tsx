import { type Config } from '@/main'

export function Heading(props: { children: string }) {
  return <h1 style={{ margin: 0, padding: 0 }}>{props.children}</h1>
}

export const headingConfig: Config = {
  Heading: {
    component: Heading,
    name: 'Heading',
    folder: ['Elements', 'Text'],
    slots: {},
    props: { children: { name: 'Children', type: 'text', default: 'Default heading' } },
  },
}
