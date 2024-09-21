import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useState, useEffect, type RefObject } from 'react'
import { DropTargetRecord, ElementDragPayload, type Input } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types'
import { useIsMutating } from '@tanstack/react-query'

export type Target<Data extends Record<string, any>> = Omit<DropTargetRecord, 'data'> & { data: WithEdge<Data> }

export function useDrop<Data extends Record<string, any>>(props: {
  dropRef: RefObject<HTMLDivElement | HTMLDetailsElement | HTMLLIElement>
  data?: Data
  onDrop?: (args: { source: ElementDragPayload; target: Target<Data> }) => void | undefined
  disableDrop?: (data: { source: ElementDragPayload; element: Element; input: Input }) => boolean
}) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [closestEdge, setClosestEdge] = useState<Edge>(null)

  const isCanvasMutating = useIsMutating({ mutationKey: ['canvas'] })

  useEffect(() => {
    const element = props.dropRef.current
    if (!element) return
    dropTargetForElements({
      element,
      onDragEnter: () => {
        setIsDraggingOver(true)
      },
      onDragLeave: () => {
        setIsDraggingOver(false)
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
      onDrop: ({ source, location, self }) => {
        const target = location.current.dropTargets[0] as Target<Data>
        if (self.element === target.element) {
          props.onDrop?.({ source, target })
        }
        setIsDraggingOver(false)
        setClosestEdge(null)
      },
      canDrop: ({ source, element, input }) => {
        const sourceEl = source.element.closest('[data-drop-target-for-element="true"]')

        // Common
        // - stop dragging inside child droppables
        if (sourceEl?.contains(element)) return false

        if (isCanvasMutating) return false
        // Custom
        if (props.disableDrop?.({ source, element, input })) return false
        return true
      },
    })
  }, [props.data])
  return { isDraggingOver, closestEdge }
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

type WithEdge<T> = T & { edge: Edge }
const allowedEdges = ['top', 'bottom', null] as const
export type Edge = (typeof allowedEdges)[number]
