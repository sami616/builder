import { type Context } from '../main'

import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRouteWithContext<Context>()({
  component: () => (
    <>
      <ul>
        <li>
          <Link to="/pages">Pages</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
      <Outlet />
    </>
  ),
})
