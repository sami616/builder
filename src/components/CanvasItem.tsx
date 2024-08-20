import { ReactNode, useEffect, useRef, useState } from 'react'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import './CanvasItem.css'

import {
  extractClosestEdge,
  attachClosestEdge,
  type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { DropIndicator } from './DropIndicator'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { type Experience } from '../db'
import { createPortal } from 'react-dom'

export function CanvasItem(props: {
  children: ReactNode
  index: number
  experience: Experience
  isCanvasUpdatePending: boolean
  block: Experience['blocks'][number]
  activeBlockId?: string
  setActiveBlockId: (id: string | undefined) => void
}) {
  const dropRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const [isDragging, setDragging] = useState(false)
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
  const context = useRouteContext({ from: '/experiences/$id' })
  const [dragPreviewContainer, setDragPreviewContainer] =
    useState<HTMLElement | null>(null)

  const deleteExperienceBlock = useMutation({
    mutationFn: () => {
      const clonedExperience = structuredClone(props.experience)
      const filteredBlocks = props.experience.blocks.filter(
        (b) => b.id !== props.block.id,
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

  const isActiveBlock = props.activeBlockId === props.block.id
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
            props.setActiveBlockId(props.block.id)
          }}
        >
          <div>
            <span ref={dragRef}>↕️</span>
            <button
              disabled={
                deleteExperienceBlock.isPending || props.isCanvasUpdatePending
              }
              onClick={async () => {
                deleteExperienceBlock.mutate()
              }}
            >
              ❌
            </button>
          </div>
        </div>
        {isActiveBlock && <div data-active></div>}
        {props.children}
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
