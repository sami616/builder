import { type ReactNode } from '@tanstack/react-router'

function Heading({
  children = initialProps.children,
}: {
  children?: ReactNode
}) {
  return <h1 style={{ margin: 0, padding: 0 }}>{children}</h1>
}

const initialProps = { children: 'Heading' }

Heading.initialProps = {
  children: 'Heading',
}

export { Heading }
