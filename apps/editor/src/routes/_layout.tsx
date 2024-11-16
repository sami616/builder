import { createFileRoute, Outlet, useParams, useParentMatches, useRouteContext } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import clsx from 'clsx'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useIsMutating, useMutation } from '@tanstack/react-query'
import { Page } from '@/db'
import { usePageGet } from '@/hooks/use-page-get'

export const Route = createFileRoute('/_layout')({ component: Layout })

function usePageUnPublish() {
  const context = Route.useRouteContext()
  return useMutation({
    mutationKey: ['page', 'publish'],
    mutationFn: (page: Page) => {
      return context.update({ entry: { ...page, status: 'Unpublished' } })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })
}

function usePagePublish() {
  const context = Route.useRouteContext()
  return useMutation({
    mutationKey: ['page', 'publish'],
    mutationFn: (page: Page) => {
      return context.update({
        entry: { ...page, status: 'Published', publishedAt: new Date() },
      })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })
}

function Layout() {
  const params = useParams({ strict: false })
  const publishMutation = usePagePublish()
  const unpublishMutation = usePageUnPublish()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const { pageGet } = usePageGet({ id: Number(params.id) })

  return (
    <>
      <div className="w-full p-2 items-center justify-between flex gap-2">
        <div className="flex gap-2 items-center">
          <Button asChild variant="ghost" size="icon">
            <Link from={Route.fullPath} to="../">
              <ChevronLeft size={16} />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">{pageGet.data.title}</h1>
          <Badge
            variant="outline"
            className={clsx({
              'text-emerald-500 border-emerald-500': pageGet.data.status === 'Published',
            })}
          >
            {pageGet.data.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button asChild disabled={isCanvasMutating} variant="secondary">
            <Link to="/pages/$id/preview" params={{ id: String(pageGet.data.id) }}>
              Preview
            </Link>
          </Button>
          {pageGet.data.status === 'Published' && (
            <Button disabled={isCanvasMutating} variant="destructive" onClick={() => unpublishMutation.mutate(pageGet.data)}>
              Unpublish
            </Button>
          )}
          <Button disabled={isCanvasMutating} className="relative" onClick={() => publishMutation.mutate(pageGet.data)}>
            {pageGet.data.publishedAt && pageGet.data.publishedAt < pageGet.data.updatedAt && (
              <div className="bg-emerald-500 absolute px-0 -top-1 -right-1 size-3 rounded-xl"></div>
            )}
            Publish
          </Button>
        </div>
      </div>
      <Outlet />
    </>
  )
}
