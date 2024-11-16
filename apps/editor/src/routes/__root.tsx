import { type Context } from '@/main'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ActiveProvider } from '@/hooks/use-active'

export const Route = createRootRouteWithContext<Context>()({
  component: () => (
    <ActiveProvider>
      <Outlet />
    </ActiveProvider>
  ),
})
