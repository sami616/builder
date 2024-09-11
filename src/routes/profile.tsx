import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile')({
  component: () => <h1>Profile</h1>,
})
