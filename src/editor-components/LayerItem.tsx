import { useMutationState, useSuspenseQuery } from '@tanstack/react-query'
import { Experience, type Block } from '../db'
import { useRouteContext } from '@tanstack/react-router'
import { ComponentProps, useRef } from 'react'
import './LayerItem.css'
import { DropIndicator } from './DropIndicator'
import { useSlotItem } from '../utils/useSlotItem'
import { useSlot } from '../utils/useSlot'
import { DragPreview } from './DragPreview'

export function LayerItem(props: {
  blockId: Block['id']
  index: number
  isCanvasUpdatePending: boolean
  parent: { slot: string; node: Block } | { slot: string; node: Experience }
  hoveredBlockId?: Block['id']
  setHoveredBlockId: (id: Block['id'] | undefined) => void
}) {
  const context = useRouteContext({ from: '/experiences/$id' })
  const slotItemSourceRef = useRef<HTMLLIElement>(null)
  const slotItemTargetRef = useRef<HTMLLIElement>(null)
  const query = useSuspenseQuery({
    queryKey: ['blocks', props.blockId],
    queryFn: () => context.get({ id: props.blockId, type: 'blocks' }),
  })

  const mutationState = useMutationState<Block>({
    filters: {
      mutationKey: ['updateBlock', props.blockId],
      status: 'pending',
    },
    select: (data) => (data.state.variables as Record<'block', Block>).block,
  })?.at(-1)

  const block = mutationState ?? query.data

  const isHoveredBlock = props.hoveredBlockId === props.blockId

  const { isDraggingSource, closestEdge, dragPreviewContainer } = useSlotItem({
    slotItemSourceRef,
    slotItemTargetRef,
    parent: props.parent,
    block,
    index: props.index,
    disableDrag: props.isCanvasUpdatePending,
  })

  return (
    <li
      style={{ opacity: isDraggingSource ? 0.5 : 1, color: isHoveredBlock ? 'red' : 'unset' }}
      data-component="LayerItem"
      onMouseOver={(e) => {
        e.stopPropagation()
        props.setHoveredBlockId(props.blockId)
      }}
      onMouseOut={(e) => {
        e.stopPropagation()
        props.setHoveredBlockId(undefined)
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        console.log(e.target)
        // Todo: Rename layer (block.name)
      }}
      ref={slotItemTargetRef}
    >
      <span ref={slotItemSourceRef}>m</span>
      {query.data.name}

      {Object.keys(block.slots).map((slot) => (
        <LayerItemSlot
          // isHoveredBlock={isHoveredBlock}
          hoveredBlockId={props.hoveredBlockId}
          setHoveredBlockId={props.setHoveredBlockId}
          key={slot}
          slot={slot}
          block={block}
          isCanvasUpdatePending={props.isCanvasUpdatePending}
          parent={props.parent}
        />
      ))}
      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Move {block.name} ↕</DragPreview>
    </li>
  )
}

function LayerItemSlot(props: {
  block: Block
  slot: string
  isCanvasUpdatePending: ComponentProps<typeof LayerItem>['isCanvasUpdatePending']
  parent: ComponentProps<typeof LayerItem>['parent']
  hoveredBlockId?: Block['id']
  setHoveredBlockId: (id: Block['id'] | undefined) => void
}) {
  const slotTargetRef = useRef<HTMLDetailsElement>(null)

  const { isDraggingOverSlot } = useSlot({
    slotTargetRef,
    parent: { slot: props.slot, node: props.block },
  })
  const context = useRouteContext({ from: '/experiences/$id' })

  const hasSlotEntries = props.block.slots[props.slot].length > 0

  return (
    <details open={hasSlotEntries} style={{ outline: isDraggingOverSlot ? '2px solid red' : 'none' }} ref={slotTargetRef}>
      <summary>{context.config[props.block.type].slots[props.slot].name}</summary>
      <ul>
        {props.block.slots[props.slot].map((blockId, index) => (
          <LayerItem
            hoveredBlockId={props.hoveredBlockId}
            setHoveredBlockId={props.setHoveredBlockId}
            isCanvasUpdatePending={props.isCanvasUpdatePending}
            index={index}
            parent={{ slot: props.slot, node: props.block }}
            blockId={blockId}
            key={blockId}
          />
        ))}
      </ul>
    </details>
  )
}
