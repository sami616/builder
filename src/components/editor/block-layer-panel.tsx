import { type Page } from '@/db'
import { DropZone } from '@/components/editor/drop-zone'
import { isDragData } from '@/hooks/use-drag'
import { useBlockAdd } from '@/hooks/use-block-add'
import { useTemplateApply } from '@/hooks/use-template-apply'
import { BlockLayerItem } from '@/components/editor/block-layer-item'
import { Blocks } from 'lucide-react'
import { Tree } from '../ui/tree'
import { Suspense } from 'react'

export function BlockLayerPanel(props: { page: Page }) {
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const blocks = Object.values(props.page.slots)[0]

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
    <Tree>
      {blocks.map((blockId, index) => (
        <Suspense key={blockId} fallback={null}>
          <BlockLayerItem parent={{ node: props.page, slot: 'root' }} index={index} blockId={blockId} />
        </Suspense>
      ))}
    </Tree>
  )
}
