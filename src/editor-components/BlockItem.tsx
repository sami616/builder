import { useRef } from 'react'
import { DropIndicator } from './DropIndicator'
import { type Block, type Experience } from '../db'
import { useMutationState } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

import './BlockItem.css'
import { DragPreview } from './DragPreview'
import { DropZone } from './DropZone'
import { useDragDrop } from '../utils/useDragDrop'
import { useBlockDelete } from '../utils/useBlockDelete'
import { useBlockCopy } from '../utils/useBlockCopy'
import { useBlock } from '../utils/useBlock'

export function BlockItem(props: {
  index: number
  experience: Experience
  isCanvasUpdatePending: boolean
  parent: { slot: string; node: Block | Experience }
  blockId: Block['id']
  activeBlockId?: Block['id']
  setActiveBlockId: (id: Block['id'] | undefined) => void
  hoveredBlockId?: Block['id']
  setHoveredBlockId: (id: Block['id'] | undefined) => void
}) {
  const dropRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const context = useRouteContext({ from: '/experiences/$id' })
  const query = useBlock({ id: props.blockId })

  const mutationState = useMutationState<Block>({
    filters: {
      mutationKey: ['updateBlock', props.blockId],
      status: 'pending',
    },
    select: (data) => (data.state.variables as Record<'block', Block>).block,
  })?.at(-1)

  const blockCopy = useBlockCopy()
  const blockDelete = useBlockDelete()

  const isActiveBlock = props.activeBlockId === props.blockId
  const isHoveredBlock = props.hoveredBlockId === props.blockId

  const block = mutationState ?? query.data
  const componentProps = block.props

  const { isDraggingSource, closestEdge, dragPreviewContainer } = useDragDrop({
    dragRef,
    dropRef,
    disableDrag: props.isCanvasUpdatePending,
    data: {
      id: 'blockDragDrop',
      index: props.index,
      parent: props.parent,
      node: block,
    },
  })

  const componentBlocks = Object.keys(block.slots).reduce<{
    [key: string]: JSX.Element[] | JSX.Element
  }>((acc, slot) => {
    if (block.slots[slot].length === 0) {
      acc[slot] = <DropZone label={context.config[block.type].slots[slot].name} data={{ id: 'blockDrop', parent: { slot, node: block } }} />
    } else {
      acc[slot] = block.slots[slot].map((blockId, index) => {
        return (
          <BlockItem
            hoveredBlockId={props.hoveredBlockId}
            setHoveredBlockId={props.setHoveredBlockId}
            index={index}
            parent={{ slot, node: block }}
            experience={props.experience}
            activeBlockId={props.activeBlockId}
            setActiveBlockId={props.setActiveBlockId}
            key={blockId}
            isCanvasUpdatePending={props.isCanvasUpdatePending}
            blockId={blockId}
          />
        )
      })
    }

    return acc
  }, {})

  const Component = context.config[block.type].component

  return (
    <div
      // @ts-ignore
      style={{ anchorName: `--${block.id}` }}
      data-active={isActiveBlock}
      data-hovered={isHoveredBlock}
      data-dragging={isDraggingSource}
      data-component="BlockItem"
      onDoubleClick={(e) => {
        e.stopPropagation()
        props.setActiveBlockId(props.blockId)
      }}
      onMouseOver={(e) => {
        e.stopPropagation()
        props.setHoveredBlockId(props.blockId)
        popoverRef.current?.showPopover()
      }}
      onMouseOut={(e) => {
        e.stopPropagation()
        props.setHoveredBlockId(undefined)
        popoverRef.current?.hidePopover()
      }}
      ref={dropRef}
    >
      <div
        // @ts-ignore
        style={{ positionAnchor: `--${block.id}` }}
        popover="true"
        ref={popoverRef}
        data-context
      >
        <div>
          <span ref={dragRef}>Move</span>
          <button
            onClick={() => {
              blockCopy.mutate({ index: props.index, root: { store: 'blocks', id: props.blockId }, parent: props.parent })
            }}
          >
            Duplicate
          </button>
          <button
            onClick={() => {
              blockDelete.mutate({
                index: props.index,
                blockId: props.blockId,
                parent: props.parent,
              })
              props.setActiveBlockId(undefined)
            }}
          >
            Delete
          </button>
        </div>
      </div>
      <Component {...componentProps} {...componentBlocks} />
      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Move {block.name} ↕</DragPreview>
    </div>
  )
}
