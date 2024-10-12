import { type Page, type Block } from '@/db'
import { Dispatch, SetStateAction, useRef } from 'react'
import { useDrag, isDragData } from '@/hooks/use-drag'
import { useDrop } from '@/hooks/use-drop'
import { useBlockUpdateName } from '@/hooks/use-block-update-name'
import { useBlockGet } from '@/hooks/use-block-get'
import { useTemplateApply } from '@/hooks/use-template-apply'
import { BlockLayerItemSlot } from '@/components/editor/block-layer-item-slot'
import { useBlockAdd } from '@/hooks/use-block-add'
import { useBlockMove } from '@/hooks/use-block-move'
import { isBlock } from '@/api'
import { Layers2 } from 'lucide-react'
import { validateComponentSlots } from '@/components/editor/block-item'
import { TreeItem, TreeItemContent, TreeItemHead, TreeItemIcon, TreeItemLabel, TreeItemTrigger } from '@/components/ui/tree'
import { DropIndicator } from './drop-indicator'
import { DragPreview } from './drag-preview'
import clsx from 'clsx'
import { BlockLayerItemActions } from './block-layer-item-actions'
import { useActive } from './active-provider'

export function BlockLayerItem(props: {
  blockId: Block['id']
  index: number
  parent: { slot: string; node: Block } | { slot: string; node: Page }
  hoveredBlockId?: Block['id']
  setHoveredBlockId: Dispatch<SetStateAction<Block['id'] | undefined>>
}) {
  const { setActive, isActive } = useActive()
  const dragRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLLIElement>(null)
  const { blockGet } = useBlockGet({ id: props.blockId })
  const { blockUpdateName } = useBlockUpdateName()
  const { blockMove } = useBlockMove()
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const isHoveredBlock = props.hoveredBlockId === props.blockId
  const isActiveBlock = isActive({ id: props.blockId, store: 'blocks' })
  const isLeaf = Object.keys(blockGet.data.slots).length === 0

  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: { id: 'block', parent: props.parent, node: blockGet.data, index: props.index },
  })

  const { closestEdge } = useDrop({
    dropRef,
    data: { parent: props.parent, node: blockGet.data, index: props.index },
    onDrop: ({ source, target }) => {
      if (isDragData['component'](source.data)) {
        blockAdd({ source: source.data, target: target.data })
      }
      if (isDragData['template'](source.data)) {
        templateApply({ source: source.data, target: target.data })
      }
      if (isDragData['block'](source.data)) {
        blockMove({ source: source.data, target: target.data })
      }
    },
    disableDrop: ({ source, element }) => {
      if (isBlock(props.parent.node)) {
        try {
          validateComponentSlots({ source, element, node: props.parent.node, slot: props.parent.slot })
        } catch (e) {
          return true
        }
      }
    },
  })

  return (
    <TreeItem
      customRef={dropRef}
      htmlProps={{
        'data-drop-id': `block-${blockGet.data.id}`,
        className: clsx([
          'outline',
          'outline-2',
          '-outline-offset-2',
          'outline-none',
          isDraggingSource && 'opacity-50',
          isActiveBlock && 'outline-rose-500',
          isHoveredBlock && 'outline-emerald-500',
          isHoveredBlock && isActiveBlock && 'outline-rose-600',
        ]),
        onClick: (e) => {
          e.stopPropagation()
          setActive((active) => {
            if (active?.id === props.blockId) return undefined
            return { store: 'blocks', id: props.blockId }
          })
        },
        onMouseLeave: (e) => {
          e.stopPropagation()
          props.setHoveredBlockId(undefined)
        },
        onMouseOver: (e) => {
          e.stopPropagation()
          props.setHoveredBlockId(props.blockId)
        },
      }}
    >
      <TreeItemHead customRef={dragRef}>
        <TreeItemTrigger hide={isLeaf} />
        <TreeItemIcon icon={Layers2} />
        <TreeItemLabel
          label={blockGet.data.name}
          onRename={(updatedName) => {
            blockUpdateName({ block: blockGet.data, name: updatedName })
          }}
        />

        <BlockLayerItemActions block={blockGet.data} index={props.index} parent={props.parent} />
      </TreeItemHead>
      <TreeItemContent>
        {Object.keys(blockGet.data.slots).map((slot) => (
          <BlockLayerItemSlot
            hoveredBlockId={props.hoveredBlockId}
            setHoveredBlockId={props.setHoveredBlockId}
            key={slot}
            slot={slot}
            block={blockGet.data}
            parent={props.parent}
          />
        ))}
      </TreeItemContent>
      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>{blockGet.data.name}</DragPreview>
    </TreeItem>
  )
}
