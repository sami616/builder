import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
import { type Block, type Experience } from '../db'
import {
  useMutation,
  useMutationState,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import * as components from '../components'
import './CanvasItem.css'

export function CanvasItem(props: {
  index: number
  experience: Experience
  isCanvasUpdatePending: boolean
  blockId: Block['id']
  activeBlockId?: Block['id']
  setActiveBlockId: (id: Block['id'] | undefined) => void
}) {
  const dropRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const [isDragging, setDragging] = useState(false)
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
  const context = useRouteContext({ from: '/experiences/$id' })

  const query = useSuspenseQuery({
    queryKey: ['blocks', String(props.blockId)],
    queryFn: () => context.getBlock({ blockId: props.blockId }),
  })

  const mutationState = useMutationState<Block>({
    filters: {
      mutationKey: ['updateBlock', String(props.blockId)],
      status: 'pending',
    },
    // Todo: how do i type variables here
    select: (data) => data.state.variables.block,
  })?.at(-1)

  const [dragPreviewContainer, setDragPreviewContainer] =
    useState<HTMLElement | null>(null)

  // Todo: this mutation should do both the delete and update of experience in one promise/promsise.all
  const deleteBlock = useMutation({
    mutationFn: context.deleteBlock,
    onSuccess: () => {
      context.queryClient.invalidateQueries({
        queryKey: ['blocks', String(props.blockId)],
      })
    },
  })

  const removeBlockFromExperience = useMutation({
    mutationFn: () => {
      const clonedExperience = structuredClone(props.experience)
      const filteredBlocks = props.experience.blocks.filter(
        (b) => b !== props.blockId,
      )
      clonedExperience.blocks = filteredBlocks
      return context.updateExperience({ experience: clonedExperience })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({
        queryKey: ['experiences', String(props.experience.id)],
      })
    },
  })

  useEffect(() => {
    const dragElement = dragRef.current
    const dropElement = dropRef.current
    if (!dragElement || !dropElement) return
    return combine(
      draggable({
        element: dragElement,
        getInitialData: (): CanvasSource => ({
          index: props.index,
          id: 'canvasItem',
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
          if (target.data.id === 'canvasItem') {
            const extractedEdge = extractClosestEdge(self.data)
            setClosestEdge((currEdge) => {
              if (currEdge === extractedEdge) return currEdge
              return extractedEdge
            })
          }
        },
        getData: ({ input }) => {
          const data: CanvasTarget = { id: 'canvasItem', index: props.index }
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
  }, [props.index, props.isCanvasUpdatePending])

  const isActiveBlock = props.activeBlockId === props.blockId

  const block = mutationState ?? query.data
  const componentProps = block.props
  const Component = components[block.type]

  return (
    <>
      <div
        style={{ opacity: isDragging || props.isCanvasUpdatePending ? 0.5 : 1 }}
        data-component="CanvasItem"
        ref={dropRef}
      >
        <div
          data-context
          onDoubleClick={() => {
            props.setActiveBlockId(props.blockId)
          }}
        >
          <div>
            <span ref={dragRef}>↕️</span>
            <button
              onClick={async () => {
                deleteBlock.mutate(props.blockId)
                removeBlockFromExperience.mutate()
                props.setActiveBlockId(undefined)
              }}
            >
              X
            </button>
          </div>
        </div>
        {isActiveBlock && <div data-active />}
        { /* Todo: Fix typing error */ }
        <Component {...componentProps} />
        <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      </div>

      {dragPreviewContainer
        ? createPortal(
            <div
              style={{
                opacity: 1,
                background: '#efefef',
                borderRadius: '1rem',
                fontFamily: 'sans-serif',
                padding: '10px',
              }}
            >
              Move block ↕️
            </div>,
            dragPreviewContainer,
          )
        : null}
    </>
  )
}

export function isCanvasItemSource(
  args: Record<string, unknown>,
): args is CanvasSource {
  return typeof args.index === 'number' && args.id === 'canvasItem'
}

type CanvasSource = {
  index: number
  id: 'canvasItem'
}

export function isCanvasItemTarget(
  args: Record<string, unknown>,
): args is CanvasTarget {
  return typeof args.index === 'number' && args.id === 'canvasItem'
}

type CanvasTarget = {
  id: 'canvasItem'
  index: number
}
