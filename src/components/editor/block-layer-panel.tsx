import { type Page } from '@/db'
import { DropZone } from '@/components/editor/drop-zone'
import { isDragData } from '@/hooks/use-drag'
import { useBlockAdd } from '@/hooks/use-block-add'
import { useTemplateApply } from '@/hooks/use-template-apply'
import { BlockLayerItem } from '@/components/editor/block-layer-item'
import { Blocks } from 'lucide-react'
import { Tree } from '../ui/tree'
import { useDeferredValue } from 'react'
import clsx from 'clsx'

export function BlockLayerPanel(props: { page: Page }) {
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const blocks = Object.values(props.page.slots)[0]
  const deferredBlocks = useDeferredValue(blocks)
  const isStale = blocks !== deferredBlocks

  if (blocks.length === 0) {
    return (
      <DropZone
        children={
          <>
            <Blocks size={20} className="stroke-gray-400" />
            Start building
          </>
        }
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
    <Tree className={clsx(['transition-opacity', isStale ? 'opacity-50' : 'opacity-100'])}>
      {blocks.map((blockId, index) => (
        <BlockLayerItem key={blockId} parent={{ node: props.page, slot: 'root' }} index={index} blockId={blockId} />
      ))}
    </Tree>
  )
}
