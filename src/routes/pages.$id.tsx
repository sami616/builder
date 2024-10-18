import { createFileRoute } from '@tanstack/react-router'
import { type Page } from '@/db'
import { Suspense, useState } from 'react'
import { ComponentPanel } from '@/components/editor/component-panel'
// import { PropsPanel } from '@/components/editor/props-panel'
import { BlockLayerPanel } from '@/components/editor/block-layer-panel'
import { DropZone } from '@/components/editor/drop-zone'
import { BlockItem } from '@/components/editor/block-item'
import { TemplatePanel } from '@/components/editor/templates-panel'
import { usePageGet, pageGetOpts } from '@/hooks/use-page-get'
import { templateGetManyOpts, useTemplateGetMany } from '@/hooks/use-template-get-many'
import { isDragData } from '@/hooks/use-drag'
import { useBlockAdd } from '@/hooks/use-block-add'
import { useTemplateApply } from '@/hooks/use-template-apply'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Blocks } from 'lucide-react'

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
  const { pageGet } = usePageGet({ id: Number(id) })
  const { templateGetMany } = useTemplateGetMany()
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const blocks = Object.values(pageGet.data.slots)[0]
  const [activeTab, setActiveTab] = useState('components')

  return (
    <main className="h-[calc(100vh-62px)]">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel minSize={20} defaultSize={20}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel>
              <ScrollArea className="h-full w-full">
                <Tabs defaultValue="components" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full rounded-none">
                    <TabsTrigger className="grow" value="components">
                      Components
                    </TabsTrigger>
                    <TabsTrigger className="grow" value="templates">
                      Templates
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent hidden={activeTab !== 'components'} forceMount value="components">
                    <ComponentPanel page={pageGet.data} />
                  </TabsContent>
                  <TabsContent hidden={activeTab !== 'templates'} forceMount value="templates">
                    <TemplatePanel templates={templateGetMany.data} />
                  </TabsContent>
                </Tabs>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <ScrollArea className="h-full w-full">
                <h4 className="p-4">Layers</h4>
                <BlockLayerPanel page={pageGet.data} />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <ScrollArea className="h-full w-full">
            <div>
              {blocks.length === 0 && (
                <DropZone
                  children={
                    <>
                      <Blocks size={20} className="opacity-40" />
                      Start building
                    </>
                  }
                  data={{ parent: { slot: 'root', node: pageGet.data } }}
                  onDrop={({ source, target }) => {
                    if (isDragData['template'](source.data)) {
                      templateApply({ source: source.data, target: target.data })
                    }
                    if (isDragData['component'](source.data)) {
                      blockAdd({ source: source.data, target: target.data })
                    }
                  }}
                />
              )}
              {blocks.map((blockId, index) => {
                return (
                  <Suspense key={blockId} fallback={null}>
                    <BlockItem blockId={blockId} parent={{ node: pageGet.data, slot: 'root' }} index={index} page={pageGet.data} />
                  </Suspense>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </ResizablePanel>
        <>
          <ResizableHandle />
          <ResizablePanel minSize={20} defaultSize={20}>
            <ScrollArea className="h-full w-full">
              {/* <PropsPanel /> */}
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </ResizablePanel>
        </>
      </ResizablePanelGroup>
    </main>
  )
}
