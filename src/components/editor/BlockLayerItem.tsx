import { type Page, type Block } from '@/db'
import { Dispatch, SetStateAction, useRef, useState } from 'react'
import { isDragData } from '@/hooks/useDrag'
import { useDrop } from '@/hooks/useDrop'
import { useBlockUpdateName } from '@/hooks/useBlockUpdateName'
import { useBlockGet } from '@/hooks/useBlockGet'
import { useTemplateApply } from '@/hooks/useTemplateApply'
import { useDrag } from '@/hooks/useDrag'
import { BlockLayerItemSlot } from '@/components/editor/BlockLayerItemSlot'
import { useBlockAdd } from '@/hooks/useBlockAdd'
import { useBlockMove } from '@/hooks/useBlockMove'
import { isBlock } from '@/api'
import { Component } from 'lucide-react'
import { validateComponentSlots } from '@/components/editor/BlockItem'
import { Tree } from '../ui/tree'
import { useIsMutating } from '@tanstack/react-query'
import { useBlockActions } from '@/hooks/useBlockActions'

export function BlockLayerItem(props: {
  blockId: Block['id']
  index: number
  parent: { slot: string; node: Block } | { slot: string; node: Page }
  hoveredBlockId?: Block['id']
  setHoveredBlockId: Dispatch<SetStateAction<Block['id'] | undefined>>
  setActiveBlockId: Dispatch<SetStateAction<Block['id'] | undefined>>
  activeBlockId?: Block['id']
}) {
  const dragRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLLIElement>(null)
  const { blockGet } = useBlockGet({ id: props.blockId })
  const { blockUpdateName } = useBlockUpdateName()
  const isHoveredBlock = props.hoveredBlockId === props.blockId
  const isActiveBlock = props.activeBlockId === props.blockId
  const { blockMove } = useBlockMove()
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const [open, setOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const { blockActions } = useBlockActions({
    index: props.index,
    block: blockGet.data,
    parent: props.parent,
    isActiveBlock,
    setActiveBlockId: props.setActiveBlockId,
    setIsRenaming,
  })

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
        disabled: isCanvasMutating,
      }}
      item={{ label: blockGet.data.name, icon: Component }}
      isActive={isActiveBlock}
      setActive={(e) => {
        e.stopPropagation()
        props.setActiveBlockId((id) => {
          if (id === props.blockId) return undefined
          return props.blockId
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
          activeBlockId={props.activeBlockId}
          setActiveBlockId={props.setActiveBlockId}
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
