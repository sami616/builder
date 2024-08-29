import { ComponentProps, useEffect, useRef, useState } from 'react'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import {
  extractClosestEdge,
  attachClosestEdge,
  type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
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

export function CanvasItem(props: {
  index: number
  experience: Experience
  isCanvasUpdatePending: boolean
  parent:
    | { slotKey: string; node: Block }
    | { slotKey: string; node: Experience }
  blockId: Block['id']
  activeBlockId?: Block['id']
  setActiveBlockId: (id: Block['id'] | undefined) => void
}) {
  const dropRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const [isDragging, setDragging] = useState(false)
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
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

  const [dragPreviewContainer, setDragPreviewContainer] =
    useState<HTMLElement | null>(null)

  const deleteBlock = useMutation({
    mutationFn: async (args: {
      blockId: Block['id']
      parent: ComponentProps<typeof CanvasItem>['parent']
    }) => {
      await context.deleteBlocksRecursivley(args.blockId)
      const clonedParentNode = structuredClone(args.parent.node)
      clonedParentNode.blocks[args.parent.slotKey] = args.parent.node.blocks[
        args.parent.slotKey
      ].filter((id) => id !== args.blockId)

      let parentType = ''

      if (isBlock(clonedParentNode)) {
        context.updateBlock({ block: clonedParentNode })
        parentType = 'blocks'
      } else {
        context.updateExperience({ experience: clonedParentNode })
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

  useEffect(() => {
    const dragElement = dragRef.current
    const dropElement = dropRef.current
    if (!dragElement || !dropElement) return
    return combine(
      draggable({
        element: dragElement,
        getInitialData: (): CanvasItemSource => ({
          index: props.index,
          block: block,
          id: 'canvasItem',
          parent: props.parent,
        }),
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            render({ container }) {
              setDragPreviewContainer(container)
            },
          })
        },
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
        canDrag: () => !props.isCanvasUpdatePending,
      }),
      dropTargetForElements({
        element: dropElement,
        onDrop: () => {
          setClosestEdge(null)
        },
        onDrag: ({ self, location }) => {
          const target = location.current.dropTargets[0]
          if (target.element === dropElement) {
            const extractedEdge = extractClosestEdge(self.data)
            setClosestEdge((currEdge) => {
              if (currEdge === extractedEdge) return currEdge
              return extractedEdge
            })
          } else {
            setClosestEdge(null)
          }
        },
        getData: ({ input }) => {
          const data: CanvasItemTarget = {
            id: 'canvasItem',
            index: props.index,
            block: block,
            parent: props.parent,
          }
          return attachClosestEdge(data, {
            element: dropElement,
            input,
            allowedEdges: ['top', 'bottom'],
          })
        },
        onDragLeave: () => {
          setClosestEdge(null)
        },
      }),
    )
  }, [props.index, props.isCanvasUpdatePending, block, props.parent])

  const componentBlocks = Object.keys(block.blocks).reduce<{
    [key: string]: JSX.Element[] | JSX.Element
  }>((acc, slotKey) => {
    if (block.blocks[slotKey].length === 0) {
      acc[slotKey] = (
        <DropZone
          blockKey={context.config[block.type].blocks[slotKey].name}
          parent={{ slotKey, node: block }}
        />
      )
    } else {
      acc[slotKey] = block.blocks[slotKey].map((blockId, index) => {
        return (
          <CanvasItem
            index={index}
            parent={{ slotKey, node: block }}
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
        zIndex: isHovered ? 1 : 0, // allows outline to sit above other CanvasItems
        outline: isActiveBlock
          ? '2px solid blue'
          : isHovered
            ? '2px solid red'
            : 'none',
        opacity: isDragging || props.isCanvasUpdatePending ? 0.5 : 1,
      }}
      data-component="CanvasItem"
      onDoubleClick={(e) => {
        e.stopPropagation()
        props.setActiveBlockId(props.blockId)
      }}
      onMouseOver={(e) => {
        e.stopPropagation()
        setIsHovered(true)
      }}
      onMouseOut={(e) => {
        e.stopPropagation()
        setIsHovered(false)
      }}
      ref={dropRef}
    >
      <div style={{ display: isHovered ? 'flex' : 'none' }} data-context>
        <span ref={dragRef}>Move</span>
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
      <Component {...componentProps} {...componentBlocks} />
      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>
        Move {block.name} ↕
      </DragPreview>
    </div>
  )
}

export function isCanvasItemSource(
  args: Record<string, unknown>,
): args is CanvasItemSource {
  return args.id === 'canvasItem'
}

export type CanvasItemSource = {
  index: number
  id: 'canvasItem'
  block: Block
  parent: ComponentProps<typeof CanvasItem>['parent']
}

export function isCanvasItemTarget(
  args: Record<string, unknown>,
): args is CanvasItemTarget {
  return args.id === 'canvasItem'
}

export type CanvasItemTarget = {
  id: 'canvasItem'
  index: number
  block: Block
  parent: ComponentProps<typeof CanvasItem>['parent']
}
