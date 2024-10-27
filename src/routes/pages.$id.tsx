import { createFileRoute } from '@tanstack/react-router'
import { type Page } from '@/db'
import { Suspense, useDeferredValue, useState } from 'react'
import { ComponentPanel } from '@/components/editor/component-panel'
import { PropsPanel } from '@/components/editor/props-panel'
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
import { Blocks, Loader, Monitor, Smartphone, Tablet } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { useActive } from '@/hooks/use-active'
import clsx from 'clsx'
import { useIsMutating } from '@tanstack/react-query'

export const Route = createFileRoute('/pages/$id')({
  component: Page,
  loader: async ({ context, params }) => {
    const pages = context.queryClient.ensureQueryData(pageGetOpts({ id: Number(params.id), context }))
    const templates = context.queryClient.ensureQueryData(templateGetManyOpts({ context }))
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
  const [canvasSize, setCanvasSize] = useState<string | undefined>('none')
  const { active } = useActive()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))

  return (
    <main className="h-[calc(100vh-62px)]">
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
                  <Tabs defaultValue="components" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="sticky top-0 z-20 w-full rounded-none">
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
                </ScrollArea>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel>
                <h4 className="p-4">Layers</h4>
                <ScrollArea className="h-full w-full">
                  <BlockLayerPanel page={pageGet.data} />
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <div className="py-0.5">
              <TooltipProvider>
                <ToggleGroup
                  size="sm"
                  value={canvasSize}
                  onValueChange={(val) => {
                    if (val) setCanvasSize(val)
                  }}
                  type="single"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem value="none">
                        <Monitor size={16} className="stroke-gray-400" />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Desktop</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem value="768px">
                        <Tablet size={16} className="stroke-gray-400" />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tablet</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem value="360px">
                        <Smartphone size={16} className="stroke-gray-400" />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mobile</p>
                    </TooltipContent>
                  </Tooltip>
                </ToggleGroup>
              </TooltipProvider>
            </div>
            <Separator />
            <ScrollArea className="h-full w-full">
              <div
                className={clsx(['mx-auto', 'min-h-full', 'transition-opacity', isCanvasMutating ? 'opacity-50' : 'opacity-100'])}
                style={{ maxWidth: canvasSize }}
              >
                {blocks.length === 0 && (
                  <DropZone
                    children={
                      <>
                        <Blocks size={20} className="stroke-gray-400" />
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
                {deferredBlocks.map((blockId, index) => {
                  return <BlockItem key={blockId} blockId={blockId} parent={{ node: pageGet.data, slot: 'root' }} index={index} page={pageGet.data} />
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </ResizablePanel>
          <>
            <ResizableHandle />
            <ResizablePanel minSize={20} defaultSize={20}>
              <ScrollArea className="h-full w-full">
                {active?.store === 'blocks' ? <PropsPanel activeId={active.id} /> : <p>No block selected</p>}
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </ResizablePanel>
          </>
        </ResizablePanelGroup>
      </Suspense>
    </main>
  )
}
