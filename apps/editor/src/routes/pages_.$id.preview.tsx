import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pages_/$id/preview')({
  component: RouteComponent,
})

function RouteComponent() {
  return 'Hello /pages/$id/preview!'
}
