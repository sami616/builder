import { type Page, type Block } from '../db'
import { DropZone } from './DropZone'
import { isDragData } from '../utils/useDrag'
import { useBlockAdd } from '../utils/useBlockAdd'
import { useTemplateApply } from '../utils/useTemplateApply'
import { BlockLayerItem } from './BlockLayerItem'

export function BlockLayerPanel(props: {
  page: Page
  hoveredBlockId?: Block['id']
  setHoveredBlockId: (id: Block['id'] | undefined) => void
  activeBlockId?: Block['id']
}) {
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const blocks = Object.values(props.page.slots)[0]

  if (blocks.length === 0) {
    return (
      <DropZone
        label="Start bulding"
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
          activeBlockId={props.activeBlockId}
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