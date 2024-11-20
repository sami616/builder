import { Badge } from '#components/ui/badge.tsx'
import { Button } from '#components/ui/button.tsx'
import { Separator } from '#components/ui/separator.tsx'
import { ToggleGroup, ToggleGroupItem } from '#components/ui/toggle-group.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '#components/ui/tooltip.tsx'
import { Page } from '#db.ts'
import { usePageGet } from '#hooks/use-page-get.ts'
import { usePagePublish } from '#hooks/use-page-publish.ts'
import { usePageUnpublish } from '#hooks/use-page-unpublish.ts'
import { router } from '#main.tsx'
import { useIsMutating, useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, Outlet, useLocation, useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { ChevronLeft, Monitor, Smartphone, Tablet } from 'lucide-react'
import { z } from 'zod'

const viewSchema = z.object({ view: z.string().default('desktop') })

export const views: Record<string, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '362px',
}

export const Route = createFileRoute('/_layout')({
  component: Layout,
  validateSearch: viewSchema,
})

function Layout() {
  const params = useParams({ strict: false })
  const { pagePublish } = usePagePublish()
  const { pageUnpublish } = usePageUnpublish()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const { pageGet } = usePageGet({ id: Number(params.id) })
  const locaton = useLocation()
  const searchParams = Route.useSearch()
  const isPreview = locaton.pathname.endsWith('/preview')

  return (
    <>
      <div className="w-full p-2 items-center justify-between flex gap-2">
        <div className="flex gap-2 items-center">
          <Button asChild variant="ghost" size="icon">
            <Link to={isPreview ? '/pages/$id' : '/pages'} search={isPreview ? searchParams : undefined} params={{ id: params.id }}>
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
          <div className="py-0.5">
            <TooltipProvider>
              <ToggleGroup
                size="sm"
                value={searchParams.view}
                onValueChange={(val) => {
                  if (val) router.navigate({ from: Route.path, search: { view: val } })
                  if (!val) router.navigate({ from: Route.path, search: { view: 'desktop' } })
                }}
                type="single"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem className="group" value="desktop">
                      <Monitor size={16} className="stroke-gray-400 group-aria-checked:stroke-rose-500" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Desktop</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem className="group" value="tablet">
                      <Tablet size={16} className="stroke-gray-400 group-aria-checked:stroke-rose-500" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tablet</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem className="group" value="mobile">
                      <Smartphone size={16} className="stroke-gray-400 group-aria-checked:stroke-rose-500" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mobile</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroup>
            </TooltipProvider>
          </div>

          {!isPreview ? (
            <Button asChild disabled={isCanvasMutating} variant="secondary">
              <Link to="/pages/$id/preview" search={searchParams} params={{ id: String(pageGet.data.id) }}>
                Preview
              </Link>
            </Button>
          ) : (
            <Button asChild disabled={isCanvasMutating} variant="secondary">
              <Link to="/pages/$id" search={searchParams} params={{ id: String(pageGet.data.id) }}>
                Edit
              </Link>
            </Button>
          )}
          {pageGet.data.status === 'Published' && (
            <Button disabled={isCanvasMutating} variant="destructive" onClick={() => pageUnpublish({ entry: pageGet.data })}>
              Unpublish
            </Button>
          )}
          <Button disabled={isCanvasMutating} className="relative" onClick={() => pagePublish({ entry: pageGet.data })}>
            {pageGet.data.publishedAt && pageGet.data.publishedAt < pageGet.data.updatedAt && (
              <div className="bg-emerald-500 absolute px-0 -top-1 -right-1 size-3 rounded-xl"></div>
            )}
            Publish
          </Button>
        </div>
      </div>
      <Separator />
      <Outlet />
    </>
  )
}
