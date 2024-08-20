import { type Context } from "../main";

import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";

export const Route = createRootRouteWithContext<Context>()({
  component: () => (
    <>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/experiences">Experiences</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
      <Outlet />
    </>
  ),
});
