import { type Page, type Block } from '@/db'
import { DropZone } from '@/components/editor/drop-zone'
import { isDragData } from '@/hooks/use-drag'
import { useBlockAdd } from '@/hooks/use-block-add'
import { useTemplateApply } from '@/hooks/use-template-apply'
import { BlockLayerItem } from '@/components/editor/block-layer-item'
import { Blocks } from 'lucide-react'
import { Active } from '@/routes/pages.$id'
import { Dispatch, SetStateAction } from 'react'

export function BlockLayerPanel(props: {
  page: Page
  hoveredBlockId?: Block['id']
  setHoveredBlockId: Dispatch<SetStateAction<Block['id'] | undefined>>
  active: Active['State']
  setActive: Active['Set']
}) {
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const blocks = Object.values(props.page.slots)[0]

  if (blocks.length === 0) {
    return (
      <DropZone
        children={
          <>
            <Blocks size={20} className="opacity-40" />
            Start building
          </>
        }
        data={{ parent: { slot: 'root', node: props.page } }}
        onDrop={({ source, target }) => {
          if (isDragData['template'](source.data)) {
            templateApply.mutate({ source: source.data, target: target.data })
          }
          if (isDragData['component'](source.data)) {
            blockAdd.mutate({ source: source.data, target: target.data })
          }
        }}
      />
    )
  }
  return (
    <ul data-component="BlockLayerPanel">
      {blocks.map((blockId, index) => (
        <BlockLayerItem
          active={props.active}
          setActive={props.setActive}
          setHoveredBlockId={props.setHoveredBlockId}
          hoveredBlockId={props.hoveredBlockId}
          parent={{ node: props.page, slot: 'root' }}
          index={index}
          blockId={blockId}
          key={blockId}
        />
      ))}
    </ul>
  )
}