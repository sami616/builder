import { PreviewBlockItem } from '#components/editor/preview-block-item.tsx'
import { pageGetOpts, usePageGet } from '#hooks/use-page-get.ts'
import { views } from '#routes/_layout.tsx'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { Suspense, useDeferredValue } from 'react'

export const Route = createFileRoute('/_layout/pages/$id/preview')({
  component: () => Preview(),
  loader: async ({ context, params }) => {
    const pages = context.queryClient.ensureQueryData(pageGetOpts({ id: Number(params.id) }))
    const data = await Promise.all([pages])
    return { pages: data.at(0) }
  },
})

function Preview() {
  const { id } = Route.useParams()
  const { pageGet } = usePageGet({ id: Number(id) })
  const blocks = Object.values(pageGet.data.slots)[0]
  const deferredBlocks = useDeferredValue(blocks)
  const searchParams = useSearch({ from: '/_layout' })

  return (
    <main>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <Loader size={20} className="animate-spin stroke-gray-400" />
          </div>
        }
      >
        <div id="canvas" className="mx-auto" style={{ maxWidth: views[searchParams.view], transition: 'max-width 0.3s' }}>
          {deferredBlocks.map((id) => {
            return <PreviewBlockItem key={id} id={id} />
          })}
        </div>
      </Suspense>
    </main>
  )
}
