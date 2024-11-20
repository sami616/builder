import { BlockItem } from '#components/editor/block-item.tsx'
import { BlockLayerPanel } from '#components/editor/block-layer-panel.tsx'
import { ComponentPanel } from '#components/editor/component-panel.tsx'
import { DropZone } from '#components/editor/drop-zone.tsx'
import { HotKeys } from '#components/editor/hotkeys.tsx'
import { PropPanel } from '#components/editor/prop-panel.tsx'
import { TemplatePanel } from '#components/editor/templates-panel.tsx'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#components/ui/resizable.tsx'
import { ScrollArea, ScrollBar } from '#components/ui/scroll-area.tsx'
import { Separator } from '#components/ui/separator.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#components/ui/tabs.tsx'
import { useBlockAdd } from '#hooks/use-block-add.ts'
import { isDragData } from '#hooks/use-drag.ts'
import { pageGetOpts, usePageGet } from '#hooks/use-page-get.ts'
import { useTemplateApply } from '#hooks/use-template-apply.ts'
import { templateGetManyOpts, useTemplateGetMany } from '#hooks/use-template-get-many.ts'
import { views } from '#routes/_layout.tsx'
import { useIsMutating } from '@tanstack/react-query'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import clsx from 'clsx'
import { Layers2, Loader } from 'lucide-react'
import { Suspense, useDeferredValue, useState } from 'react'

export const Route = createFileRoute('/_layout/pages/$id/')({
  component: Page,
  loader: async ({ context, params }) => {
    const pages = context.queryClient.ensureQueryData(pageGetOpts({ id: Number(params.id) }))
    const templates = context.queryClient.ensureQueryData(templateGetManyOpts())
    const data = await Promise.all([pages, templates])
    return { pages: data.at(0), templates: data.at(1) }
  },
  // pendingComponent: () => <p>Loading..</p>,
  // errorComponent: () => <p>Error!</p>,
})

function Page() {
  const { id } = Route.useParams()
  const { pageGet } = usePageGet({ id: Number(id) })
  const { templateGetMany } = useTemplateGetMany()
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const blocks = Object.values(pageGet.data.slots)[0]
  const deferredBlocks = useDeferredValue(blocks)
  const [activeTab, setActiveTab] = useState('components')
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const searchParams = useSearch({ from: '/_layout' })

  return (
    <HotKeys>
      <main className="h-[calc(100vh-55px)]">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Loader size={20} className="animate-spin stroke-gray-400" />
            </div>
          }
        >
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel minSize={20} defaultSize={20}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel>
                  <ScrollArea className="h-full w-full">
                    <Tabs defaultValue="components" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                      <TabsList className="sticky top-0 z-20 w-full rounded-none">
                        <TabsTrigger className="grow" value="components">
                          Components
                        </TabsTrigger>
                        <TabsTrigger className="grow" value="templates">
                          Templates
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent className="grow" hidden={activeTab !== 'components'} forceMount value="components">
                        <ComponentPanel page={pageGet.data} />
                      </TabsContent>
                      <TabsContent className="grow" hidden={activeTab !== 'templates'} forceMount value="templates">
                        <TemplatePanel templates={templateGetMany.data} />
                      </TabsContent>
                    </Tabs>
                  </ScrollArea>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                  <ScrollArea className="h-full w-full">
                    <BlockLayerPanel page={pageGet.data} />
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <Separator />
              <ScrollArea className="h-full w-full">
                <div
                  id="canvas"
                  className={clsx(['mx-auto', 'h-full', 'transition-opacity', isCanvasMutating ? 'opacity-50' : 'opacity-100'])}
                  style={{ maxWidth: views[searchParams.view], transition: 'max-width 0.3s' }}
                >
                  {blocks.length === 0 && (
                    <DropZone
                      label="Drop to start building"
                      icon={Layers2}
                      data={{ parent: { slot: 'root', node: pageGet.data } }}
                      onDrop={({ source, target }) => {
                        if (isDragData['template'](source.data)) {
                          templateApply({
                            source: source.data,
                            target: target.data,
                          })
                        }
                        if (isDragData['component'](source.data)) {
                          blockAdd({ source: source.data, target: target.data })
                        }
                      }}
                    />
                  )}
                  {deferredBlocks.map((id, index) => {
                    return <BlockItem key={id} id={id} parent={{ node: pageGet.data, slot: 'root' }} index={index} page={pageGet.data} />
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </ResizablePanel>
            <>
              <ResizableHandle />
              <ResizablePanel minSize={20} defaultSize={20}>
                <ScrollArea className="h-full w-full">
                  <PropPanel />
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </ResizablePanel>
            </>
          </ResizablePanelGroup>
        </Suspense>
      </main>
    </HotKeys>
  )
}
