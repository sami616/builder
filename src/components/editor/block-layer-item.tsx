import { type Page, type Block } from '@/db'
import { Dispatch, SetStateAction, useRef, useState } from 'react'
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
import { Tree } from '@/components/ui/tree'
import { useIsMutating } from '@tanstack/react-query'
import { useBlockActions } from '@/hooks/use-block-actions'
import { Active } from '@/routes/pages.$id'
import { useKeyboard } from '@/hooks/use-keyboard'

export function BlockLayerItem(props: {
  blockId: Block['id']
  index: number
  parent: { slot: string; node: Block } | { slot: string; node: Page }
  hoveredBlockId?: Block['id']
  setHoveredBlockId: Dispatch<SetStateAction<Block['id'] | undefined>>
  setActive: Active['Set']
  active: Active['State']
}) {
  const dragRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLLIElement>(null)
  const { blockGet } = useBlockGet({ id: props.blockId })
  const { blockUpdateName } = useBlockUpdateName()
  const { blockMove } = useBlockMove()
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const [open, setOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const isHoveredBlock = props.hoveredBlockId === props.blockId
  const isActive = props.active?.store === 'blocks' && props.active.id === props.blockId

  const { blockActions } = useBlockActions({
    index: props.index,
    block: blockGet.data,
    parent: props.parent,
    setActive: props.setActive,
    setIsRenaming,
  })

  useKeyboard({ actions: blockActions, bindListeners: isActive && !isCanvasMutating })

  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: { id: 'block', parent: props.parent, node: blockGet.data, index: props.index },
  })

  const { closestEdge } = useDrop({
    dropRef,
    data: { parent: props.parent, node: blockGet.data, index: props.index },
    onDrop: ({ source, target }) => {
      if (isDragData['component'](source.data)) {
        blockAdd.mutate({ source: source.data, target: target.data })
      }
      if (isDragData['template'](source.data)) {
        templateApply.mutate({ source: source.data, target: target.data })
      }
      if (isDragData['block'](source.data)) {
        blockMove.mutate({ source: source.data, target: target.data })
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
    <Tree
      open={open}
      setOpen={setOpen}
      drop={{ ref: dropRef, edge: closestEdge }}
      drag={{ ref: dragRef, preview: { container: dragPreviewContainer, children: blockGet.data.name }, isDragging: isDraggingSource }}
      isHovered={isHoveredBlock}
      rename={{
        isRenaming,
        setIsRenaming,
        onRename: async (updatedName) => {
          await blockUpdateName.mutateAsync({ block: blockGet.data, name: updatedName })
        },
      }}
      action={{
        label: 'Layer actions',
        items: blockActions,
      }}
      disabled={isCanvasMutating}
      item={{ label: blockGet.data.name, icon: Layers2 }}
      isActive={isActive}
      setActive={(e) => {
        e.stopPropagation()
        props.setActive((active) => {
          if (active?.id === props.blockId) return undefined
          return { store: 'blocks', id: props.blockId }
        })
      }}
      li={{
        'data-drop-id': `block-${blockGet.data.id}`,
        'data-component': 'BlockLayerItem',
        onMouseLeave: (e) => {
          e.stopPropagation()
          props.setHoveredBlockId(undefined)
        },
        onMouseOver: (e) => {
          e.stopPropagation()
          props.setHoveredBlockId(props.blockId)
        },
      }}
      items={Object.keys(blockGet.data.slots).map((slot) => (
        <BlockLayerItemSlot
          active={props.active}
          setActive={props.setActive}
          hoveredBlockId={props.hoveredBlockId}
          setHoveredBlockId={props.setHoveredBlockId}
          key={slot}
          slot={slot}
          block={blockGet.data}
          parent={props.parent}
        />
      ))}
    />
  )
}
