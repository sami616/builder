import { createFileRoute } from '@tanstack/react-router'
import { type Page, type Block } from '@/db'
import { Suspense, useState } from 'react'
import { ComponentPanel } from '@/components/editor/ComponentPanel'
import { PropsPanel } from '@/components/editor/PropsPanel'
import { BlockLayerPanel } from '@/components/editor/BlockLayerPanel'
import { DropZone } from '@/components/editor/DropZone'
import { BlockItem } from '@/components/editor/BlockItem'
import { TemplatePanel } from '@/components/editor/TemplatesPanel'
import { usePageUpdateName } from '@/hooks/usePageUpdateName'
import { usePageGet, pageGetOpts } from '../hooks/usePageGet'
import { templateGetManyOpts, useTemplateGetMany } from '@/hooks/useTemplateGetMany'
import { isDragData } from '@/hooks/useDrag'
import { useBlockAdd } from '@/hooks/useBlockAdd'
import { useTemplateApply } from '@/hooks/useTemplateApply'
import { useIsMutating } from '@tanstack/react-query'
import '@/routes/pages.$id.css'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  const [activeTab, setActiveTab] = useState('components')

  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))

  return (
    <div data-component="pages.$id" className="p-4">
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
          <aside className="grid gap-4">
            <Tabs defaultValue="components" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger className="grow" value="components">
                  Components
                </TabsTrigger>
                <TabsTrigger className="grow" value="layers">
                  Layers
                </TabsTrigger>
                <TabsTrigger className="grow" value="templates">
                  Templates
                </TabsTrigger>
              </TabsList>
              <TabsContent hidden={activeTab !== 'components'} forceMount value="components">
                <ComponentPanel page={pageGet.data} />
              </TabsContent>
              <TabsContent hidden={activeTab !== 'layers'} forceMount value="layers">
                <BlockLayerPanel
                  activeBlockId={activeBlockId}
                  hoveredBlockId={hoveredBlockId}
                  setActiveBlockId={setActiveBlockId}
                  setHoveredBlockId={setHoveredBlockId}
                  page={pageGet.data}
                />
              </TabsContent>
              <TabsContent hidden={activeTab !== 'templates'} forceMount value="templates">
                <TemplatePanel templates={templateGetMany.data} />
              </TabsContent>
            </Tabs>
          </aside>
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
