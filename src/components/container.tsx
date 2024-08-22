import { type ReactNode } from '@tanstack/react-router'

function Container({
  children = initialProps.children,
}: {
  children?: ReactNode
}) {
  return (
    <div style={{ width: '100%', height: 500, background: 'orange' }}>
      {children}
    </div>
  )
}

const initialProps = { children: 'Button' }

Container.initialProps = {
  children: 'Container',
}

export { Container }
