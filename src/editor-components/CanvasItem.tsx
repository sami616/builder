import { ComponentProps, useRef, useState } from 'react'
import { DropIndicator } from './DropIndicator'
import { isBlock, type Block, type Experience } from '../db'
import {
  useMutation,
  useMutationState,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

import './CanvasItem.css'
import { DragPreview } from './DragPreview'
import { DropZone } from './DropZone'
import { useSlotItem } from '../utils/useSlotItem'

export function CanvasItem(props: {
  index: number
  experience: Experience
  isCanvasUpdatePending: boolean
  parent: { slot: string; node: Block } | { slot: string; node: Experience }
  blockId: Block['id']
  activeBlockId?: Block['id']
  setActiveBlockId: (id: Block['id'] | undefined) => void
}) {
  const slotItemTargetRef = useRef<HTMLDivElement>(null)
  const slotItemSourceRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const context = useRouteContext({ from: '/experiences/$id' })
  const [isHovered, setIsHovered] = useState(false)

  const query = useSuspenseQuery({
    queryKey: ['blocks', props.blockId],
    queryFn: () => context.getBlock({ blockId: props.blockId }),
  })

  const mutationState = useMutationState<Block>({
    filters: {
      mutationKey: ['updateBlock', props.blockId],
      status: 'pending',
    },
    select: (data) => (data.state.variables as Record<'block', Block>).block,
  })?.at(-1)

  const duplicateBlock = useMutation({
    mutationFn: async (args: {
      index: number
      blockId: Block['id']
      parent: ComponentProps<typeof CanvasItem>['parent']
    }) => {
      const rootId = await context.duplicateBlocksRecursivley(args.blockId)

      const clonedParentNode = structuredClone(args.parent.node)
      clonedParentNode.slots[args.parent.slot].splice(args.index, 0, rootId)

      let parentType = ''

      if (isBlock(clonedParentNode)) {
        await context.updateBlock({ block: clonedParentNode })
        parentType = 'blocks'
      } else {
        await context.updateExperience({ experience: clonedParentNode })
        parentType = 'experiences'
      }
      return { type: parentType, id: args.parent.node.id }
    },
    onSuccess: async ({ type, id }) => {
      context.queryClient.invalidateQueries({
        queryKey: [type, id],
      })
    },
  })

  const deleteBlock = useMutation({
    mutationFn: async (args: {
      blockId: Block['id']
      parent: ComponentProps<typeof CanvasItem>['parent']
    }) => {
      await context.deleteBlocksRecursivley(args.blockId)
      const clonedParentNode = structuredClone(args.parent.node)
      clonedParentNode.slots[args.parent.slot] = args.parent.node.slots[
        args.parent.slot
      ].filter((id) => id !== args.blockId)

      let parentType = ''

      if (isBlock(clonedParentNode)) {
        await context.updateBlock({ block: clonedParentNode })
        parentType = 'blocks'
      } else {
        await context.updateExperience({ experience: clonedParentNode })
        parentType = 'experiences'
      }
      return { type: parentType, id: args.parent.node.id }
    },

    onSuccess: async ({ type, id }) => {
      context.queryClient.invalidateQueries({
        queryKey: [type, id],
      })
    },
  })

  const isActiveBlock = props.activeBlockId === props.blockId

  const block = mutationState ?? query.data
  const componentProps = block.props

  const { isDraggingSource, closestEdge, dragPreviewContainer } = useSlotItem({
    slotItemSourceRef,
    slotItemTargetRef,
    parent: props.parent,
    index: props.index,
    block: block,
    disableDrag: props.isCanvasUpdatePending,
  })

  const componentBlocks = Object.keys(block.slots).reduce<{
    [key: string]: JSX.Element[] | JSX.Element
  }>((acc, slot) => {
    if (block.slots[slot].length === 0) {
      acc[slot] = (
        <DropZone
          label={context.config[block.type].slots[slot].name}
          parent={{ slot, node: block }}
        />
      )
    } else {
      acc[slot] = block.slots[slot].map((blockId, index) => {
        return (
          <CanvasItem
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
      style={{
        // @ts-ignore
        anchorName: `--${block.id}`,
        zIndex: isHovered ? 1 : 0, // allows outline to sit above other CanvasItems
        outline: isActiveBlock
          ? '2px solid blue'
          : isHovered
            ? '2px solid red'
            : 'none',
        opacity: isDraggingSource || props.isCanvasUpdatePending ? 0.5 : 1,
      }}
      data-component="CanvasItem"
      onDoubleClick={(e) => {
        e.stopPropagation()
        props.setActiveBlockId(props.blockId)
      }}
      onMouseOver={(e) => {
        e.stopPropagation()
        setIsHovered(true)
        popoverRef.current?.showPopover()
      }}
      onMouseOut={(e) => {
        e.stopPropagation()
        setIsHovered(false)
        popoverRef.current?.hidePopover()
      }}
      ref={slotItemTargetRef}
    >
      <div
        // @ts-ignore
        style={{ positionAnchor: `--${block.id}` }}
        popover="true"
        ref={popoverRef}
        data-context
      >
        <div>
          <span ref={slotItemSourceRef}>Move</span>
          <button
            onClick={() => {
              duplicateBlock.mutate({
                index: props.index,
                blockId: props.blockId,
                parent: props.parent,
              })
            }}
          >
            Duplicate
          </button>
          <button
            onClick={() => {
              deleteBlock.mutate({
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
      {block.id}
      <Component {...componentProps} {...componentBlocks} />
      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>
        Move {block.name} ↕
      </DragPreview>
    </div>
  )
}
