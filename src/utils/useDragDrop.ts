import { type RefObject, useEffect, useState } from 'react'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { Template, type Block, type Experience } from '../db'
import { type Input } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types'
import { isBlock, isExperience, isTemplate } from '../api'

export function useDragDrop(props: {
  dragRef: RefObject<HTMLLIElement | HTMLDivElement>
  dropRef: RefObject<HTMLLIElement | HTMLDivElement>
  disableDrag?: boolean
  data: Data
}) {
  const [dragPreviewContainer, setDragPreviewContainer] = useState<HTMLElement | null>(null)
  const [isDraggingSource, setIsDraggingSource] = useState(false)
  const [closestEdge, setClosestEdge] = useState<Edge>(null)

  useEffect(() => {
    const dragElement = props.dragRef.current
    const dropElement = props.dropRef.current
    if (!dragElement || !dropElement) return
    return combine(
      draggable({
        element: dragElement,
        getInitialData: () => props.data,
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            render({ container }) {
              setDragPreviewContainer(container)
            },
          })
        },
        onDragStart: () => setIsDraggingSource(true),
        onDrop: () => setIsDraggingSource(false),
        canDrag: () => !props.disableDrag,
      }),
      dropTargetForElements({
        element: dropElement,
        onDrop: () => {
          setClosestEdge(null)
        },
        onDrag: ({ self, location }) => {
          const extractedEdge = self.data.edge as ReturnType<typeof getEdge>
          if (self.element === location.current.dropTargets[0].element) {
            setClosestEdge((currEdge) => {
              if (currEdge === extractedEdge) return currEdge
              return extractedEdge
            })
          } else {
            setClosestEdge(null)
          }
        },
        getData: ({ input, element }) => {
          return {
            ...props.data,
            edge: getEdge(input, element),
          }
        },
        onDragLeave: () => {
          setClosestEdge(null)
        },
        canDrop: ({ source, element }) => {
          const sourceEl = source.element.closest('[data-drop-target-for-element="true"]')

          // stop dragging inside child droppables
          if (sourceEl?.contains(element)) return false
          return true
        },
      }),
    )
  }, [props.data, props.disableDrag])
  return { isDraggingSource, dragPreviewContainer, closestEdge }
}

export type DragDrop = {
  Block: {
    Source: {
      id: 'blockDragDrop'
      index: number
      node: Block
      parent: { slot: string; node: Experience | Block }
    }
    Target: {
      id: 'blockDragDrop'
      index: number
      node: Block
      parent: { slot: string; node: Experience | Block }
      edge: Edge
    }
  }
  Template: {
    Source: {
      id: 'templateDragDrop'
      index: number
      node: Template
    }
    Target: {
      id: 'templateDragDrop'
      index: number
      node: Template
      edge: Edge
    }
  }
}

const allowedEdges = ['top', 'bottom', null] as const
type Edge = (typeof allowedEdges)[number]

type Data = DragDrop['Block']['Source'] | DragDrop['Block']['Target'] | DragDrop['Template']['Source'] | DragDrop['Template']['Target']

export const isDragDrop = {
  block: {
    source(args: Record<string, any>): args is DragDrop['Block']['Source'] {
      if (args.id !== 'blockDragDrop') return false
      if (typeof args.index !== 'number') return false
      if (!isBlock(args.node)) return false
      if (typeof args.parent?.slot !== 'string') return false
      if (!isBlock(args.parent?.node) && !isExperience(args.parent?.node)) return false
      if (args.edge !== undefined) return false
      return true
    },
    target(args: Record<string, any>): args is DragDrop['Block']['Target'] {
      if (args.id !== 'blockDragDrop') return false
      if (typeof args.index !== 'number') return false
      if (!isBlock(args.node)) return false
      if (typeof args.parent?.slot !== 'string') return false
      if (!isBlock(args.parent?.node) && !isExperience(args.parent?.node)) return false
      if (args.edge === undefined || !allowedEdges.includes(args.edge)) return false
      return true
    },
  },
  template: {
    source(args: Record<string, any>): args is DragDrop['Block']['Source'] {
      if (args.id !== 'templateDragDrop') return false
      if (typeof args.index !== 'number') return false
      if (!isTemplate(args.node)) return false
      if (args.edge !== undefined) return false
      return true
    },
    target(args: Record<string, any>): args is DragDrop['Block']['Target'] {
      if (args.id !== 'templateDragDrop') return false
      if (typeof args.index !== 'number') return false
      if (!isTemplate(args.node)) return false
      if (args.edge === undefined || !allowedEdges.includes(args.edge)) return false
      return true
    },
  },
}

function getEdge(input: Input, element: Element): Edge {
  const rect = element.getBoundingClientRect()
  const thresh = 10
  const bottomThresh = rect.bottom - thresh
  const topThresh = rect.top + thresh

  if (input.clientY > bottomThresh && input.clientY < rect.bottom) {
    return 'bottom'
  }

  if (input.clientY < topThresh && input.clientY > rect.top) {
    return 'top'
  }

  return null
}
