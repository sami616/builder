import { createFileRoute } from '@tanstack/react-router'
import { Suspense, useDeferredValue } from 'react'
import { BlockItem } from '@/components/editor/block-item'
import { usePageGet, pageGetOpts } from '@/hooks/use-page-get'
import { templateGetManyOpts } from '@/hooks/use-template-get-many'
import { Loader } from 'lucide-react'
import clsx from 'clsx'
import { useIsMutating } from '@tanstack/react-query'

export const Route = createFileRoute('/_layout/pages/$id/preview')({
  component: () => Preview(),
  loader: async ({ context, params }) => {
    const pages = context.queryClient.ensureQueryData(pageGetOpts({ id: Number(params.id) }))
    const templates = context.queryClient.ensureQueryData(templateGetManyOpts({ context }))
    const data = await Promise.all([pages, templates])
    return { pages: data.at(0), templates: data.at(1) }
  },
})

function Preview() {
  const { id } = Route.useParams()
  const { pageGet } = usePageGet({ id: Number(id) })
  const blocks = Object.values(pageGet.data.slots)[0]
  const deferredBlocks = useDeferredValue(blocks)
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))

  return (
    <main className="h-[calc(100vh-55px)]">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <Loader size={20} className="animate-spin stroke-gray-400" />
          </div>
        }
      >
        <div id="canvas" className={clsx(['mx-auto', 'h-full', 'transition-opacity', isCanvasMutating ? 'opacity-50' : 'opacity-100'])}>
          {deferredBlocks.map((id, index) => {
            return <BlockItem key={id} id={id} parent={{ node: pageGet.data, slot: 'root' }} index={index} page={pageGet.data} />
          })}
        </div>
      </Suspense>
    </main>
  )
}
