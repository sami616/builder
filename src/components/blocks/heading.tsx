import { type Config } from '@/main'

export function Heading() {
  return <h1 style={{ margin: 0, padding: 0 }}>Heading</h1>
}

export const headingConfig: Config = {
  Heading: {
    component: Heading,
    name: 'Heading',
    folder: ['Elements', 'Text'],
    slots: {},
    props: {},
  },
}
