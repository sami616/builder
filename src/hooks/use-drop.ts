import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useState, useEffect, type RefObject } from 'react'
import { DropTargetRecord, ElementDragPayload, type Input } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types'
import { useIsMutating } from '@tanstack/react-query'
import { isDragData } from '@/hooks/use-drag'

export type Target<Data extends Record<string, any>> = Omit<DropTargetRecord, 'data'> & { data: WithEdge<Data> }

export function useDrop<Data extends Record<string, any>>(props: {
  dropRef: RefObject<HTMLDivElement | HTMLDetailsElement | HTMLLIElement | null>
  data?: Data
  onDrop?: (args: { source: ElementDragPayload; target: Target<Data> }) => void | undefined
  disableDrop?: (data: { source: ElementDragPayload; element: Element; input: Input }) => boolean | undefined
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
        // setIsDraggingOver(true)
      },
      onDropTargetChange({ self, location }) {
        if (self.element === location.current.dropTargets[0]?.element) {
          setIsDraggingOver(true)
        } else {
          setIsDraggingOver(false)
        }
      },
      onDragLeave: () => {
        // setIsDraggingOver(false)
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
        // Prevent dropping on self or own children
        if (isDragData['block'](source.data)) {
          const sourceId = source.element.closest('[data-drop-id^="block"]')?.getAttribute('data-drop-id')

          const targetEl = element.closest('[data-drop-id^="block"]')
          const targetId = targetEl?.getAttribute('data-drop-id')

          const commonParent = targetEl?.closest(`[data-drop-id="${sourceId}"]`)
          const dropSourceId = commonParent?.getAttribute('data-drop-id')

          const commonChild = commonParent?.querySelector(`[data-drop-id="${targetId}"]`)
          const childOrSelf = dropSourceId === targetId ? commonParent : commonChild

          if (childOrSelf) {
            if (commonParent?.contains(childOrSelf)) return false
          }
        }

        if (isCanvasMutating) return false

        // Custom
        if (props.disableDrop?.({ source, element, input })) return false

        return true
      },
    })
  }, [props.data])
  return { isDraggingOver, closestEdge }
}

export function getEdge(input: Input, element: Element): Edge {
  const rect = element.getBoundingClientRect()
  const middle = rect.top + (rect.bottom - rect.top) / 2

  if (input.clientY < middle) {
    return 'top'
  } else {
    return 'bottom'
  }
}

type WithEdge<T> = T & { edge: Edge }
const allowedEdges = ['top', 'bottom', null] as const
export type Edge = (typeof allowedEdges)[number]
