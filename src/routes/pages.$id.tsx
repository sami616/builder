import { createFileRoute } from '@tanstack/react-router'
import { type Page, type Block } from '../db'
import { Suspense, useState } from 'react'
import { ComponentPanel } from '../editor-components/ComponentPanel'
import { PropsPanel } from '../editor-components/PropsPanel'
import { BlockLayerPanel } from '../editor-components/BlockLayerPanel'
import { DropZone } from '../editor-components/DropZone'
import { BlockItem } from '../editor-components/BlockItem'
import { TemplatePanel } from '../editor-components/TemplatesPanel'
import { usePageUpdateName } from '../utils/usePageUpdateName'
import { usePageGet, pageGetOpts } from '../utils/usePageGet'
import { templateGetManyOpts, useTemplateGetMany } from '../utils/useTemplateGetMany'
import { isDragData } from '../utils/useDrag'
import { useBlockAdd } from '../utils/useBlockAdd'
import { useTemplateApply } from '../utils/useTemplateApply'
import { useIsMutating } from '@tanstack/react-query'
import './pages.$id.css'

export const Route = createFileRoute('/pages/$id')({
  component: Page,
  loader: async ({ context, params }) => {
    const pages = context.queryClient.ensureQueryData(pageGetOpts({ id: Number(params.id), context }))
    const templates = context.queryClient.ensureQueryData(templateGetManyOpts({ context }))
    const data = await Promise.all([pages, templates])
    return { pages: data.at(0), templates: data.at(1) }
  },
  pendingComponent: () => <p>Loading..</p>,
  errorComponent: () => <p>Error!</p>,
})

function Page() {
  const { id } = Route.useParams()
  const [activeBlockId, setActiveBlockId] = useState<Block['id'] | undefined>()
  const [hoveredBlockId, setHoveredBlockId] = useState<Block['id'] | undefined>()
  const { pageGet } = usePageGet({ id: Number(id) })
  const { templateGetMany } = useTemplateGetMany()
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const { pageUpdateName } = usePageUpdateName()
  const blocks = Object.values(pageGet.data.slots)[0]

  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))

  return (
    <div data-component="pages.$id">
      {/* Edit page meta data */}
      <div>
        <p>{pageGet.data.name}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget
            const formData = new FormData(form)
            pageUpdateName.mutate({ page: pageGet.data, name: formData.get('name') as string })
          }}
        >
          <fieldset disabled={pageUpdateName.isPending}>
            <input type="text" name="name" defaultValue={pageGet.data.name} />
            <button type="submit">Update</button>
          </fieldset>
        </form>
      </div>
      {pageUpdateName.isPending && <p>Updating...</p>}
      {pageUpdateName.error && <p>{pageUpdateName.error.message}</p>}

      <Suspense fallback={<p>Loading...</p>}>
        <main>
          <aside>
            <details open name="components">
              <summary>Components</summary>
              <ComponentPanel page={pageGet.data} />
            </details>
            <details open name="layers">
              <summary>Layers</summary>
              <BlockLayerPanel
                activeBlockId={activeBlockId}
                hoveredBlockId={hoveredBlockId}
                setHoveredBlockId={setHoveredBlockId}
                page={pageGet.data}
              />
            </details>
            <details open name="templates">
              <summary>Templates</summary>
              {<TemplatePanel templates={templateGetMany.data} />}
            </details>
          </aside>
          {}
          <div>
            {isCanvasMutating && <div>Updating...</div>}
            {blocks.length === 0 && (
              <DropZone
                label="Start building"
                data={{ parent: { slot: 'root', node: pageGet.data } }}
                onDrop={({ source, target }) => {
                  if (isDragData['template'](source.data)) {
                    templateApply.mutate({ source: source.data, target: target.data })
                  }
                  if (isDragData['component'](source.data)) {
                    blockAdd.mutate({ source: source.data, target: target.data })
                  }
                }}
              />
            )}
            {blocks.map((blockId, index) => {
              return (
                <BlockItem
                  blockId={blockId}
                  parent={{ node: pageGet.data, slot: 'root' }}
                  index={index}
                  page={pageGet.data}
                  activeBlockId={activeBlockId}
                  setActiveBlockId={setActiveBlockId}
                  hoveredBlockId={hoveredBlockId}
                  setHoveredBlockId={setHoveredBlockId}
                  key={blockId}
                />
              )
            })}
          </div>
          {activeBlockId !== undefined && (
            <aside>
              <PropsPanel activeBlockId={activeBlockId} setActiveBlockId={setActiveBlockId} />
            </aside>
          )}
        </main>
      </Suspense>
    </div>
  )
}