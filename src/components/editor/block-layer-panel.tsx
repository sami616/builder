import { type Page } from '@/db'
import { DropZone } from '@/components/editor/drop-zone'
import { isDragData } from '@/hooks/use-drag'
import { useBlockAdd } from '@/hooks/use-block-add'
import { useTemplateApply } from '@/hooks/use-template-apply'
import { BlockLayerItem } from '@/components/editor/block-layer-item'
import { Layers2 } from 'lucide-react'
import { Tree } from '../ui/tree'
import { useDeferredValue } from 'react'
import clsx from 'clsx'
import { useIsMutating } from '@tanstack/react-query'

export function BlockLayerPanel(props: { page: Page }) {
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const deferredBlocks = useDeferredValue(Object.values(props.page.slots)[0])
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))

  if (deferredBlocks.length === 0) {
    return (
      <DropZone
        icon={Layers2}
        label="Drop to start building"
        data={{ parent: { slot: 'root', node: props.page } }}
        onDrop={({ source, target }) => {
          if (isDragData['template'](source.data)) {
            templateApply({ source: source.data, target: target.data })
          }
          if (isDragData['component'](source.data)) {
            blockAdd({ source: source.data, target: target.data })
          }
        }}
      />
    )
  }
  return (
    <>
      <h4 className="font-medium text-sm p-4">Layers</h4>
      <Tree className={clsx(['transition-opacity', isCanvasMutating ? 'opacity-50' : 'opacity-100'])}>
        {deferredBlocks.map((blockId, index) => (
          <BlockLayerItem key={blockId} parent={{ node: props.page, slot: 'root' }} index={index} id={blockId} />
        ))}
      </Tree>
    </>
  )
}
