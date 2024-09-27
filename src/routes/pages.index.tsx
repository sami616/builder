import { createFileRoute } from '@tanstack/react-router'
import { pageGetManyOpts, usePageGetMany } from '../utils/usePageGetMany'
import { Skeleton } from '@/components/ui/skeleton'
import { PageTable } from '@/editor-components/PageTable'

// Route
export const Route = createFileRoute('/pages/')({
  component: Pages,
  loader: ({ context }) => context.queryClient.ensureQueryData(pageGetManyOpts({ context })),
  pendingComponent: () => (
    <div className="m-2">
      <Skeleton className="w-full h-14 mt-4 mb-4" />
      <Skeleton className="w-full h-svh" />
    </div>
  ),
  errorComponent: () => <p>Error!</p>,
})

// Route Component
export function Pages() {
  const { pageGetMany } = usePageGetMany()
  return (
    <div className="p-2">
      {pageGetMany.isRefetching && <p>Refetching...</p>}
      <PageTable />
    </div>
  )
}
