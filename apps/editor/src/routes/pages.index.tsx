import { PageTable } from '#components/editor/page-table.tsx'
import { Skeleton } from '#components/ui/skeleton.tsx'
import { pageGetManyOpts, usePageGetMany } from '#hooks/use-page-get-many.ts'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

// Route
export const Route = createFileRoute('/pages/')({
  component: Pages,
  loader: ({ context }) => context.queryClient.ensureQueryData(pageGetManyOpts({ context })),
  // Todo: nice skeleton table
  pendingComponent: () => (
    <div className="m-2">
      <Skeleton className="w-full h-14 mt-4 mb-4" />
      <Skeleton className="w-full h-svh" />
    </div>
  ),
  // Todo: nice error ui
  errorComponent: () => null,
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
