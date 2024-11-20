import { ActiveProvider } from '#hooks/use-active.tsx'
import { type Context } from '#main.tsx'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

export const Route = createRootRouteWithContext<Context>()({ component: Root })

function Root() {
  return (
    <ActiveProvider>
      <Outlet />
    </ActiveProvider>
  )
}
