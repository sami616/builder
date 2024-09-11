import { type RefObject, useEffect, useState } from 'react'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { type Block, type Experience } from '../db'
import { type Input } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types'

export function useSlotItem(props: {
  slotItemSourceRef: RefObject<HTMLLIElement | HTMLDivElement>
  slotItemTargetRef: RefObject<HTMLLIElement | HTMLDivElement>
  block: Block
  disableDrag?: boolean
  index: number
  parent: { slot: string; node: Experience } | { slot: string; node: Block }
}) {
  const [dragPreviewContainer, setDragPreviewContainer] = useState<HTMLElement | null>(null)
  const [isDraggingSource, setIsDraggingSource] = useState(false)
  const [closestEdge, setClosestEdge] = useState<'top' | 'bottom' | null>(null)

  useEffect(() => {
    const dragElement = props.slotItemSourceRef.current
    const dropElement = props.slotItemTargetRef.current
    if (!dragElement || !dropElement) return
    return combine(
      draggable({
        element: dragElement,
        getInitialData: (): SlotItemSource => ({
          index: props.index,
          block: props.block,
          id: 'slotItem',
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
        getData: ({ input, element }): SlotItemTarget => {
          return {
            id: 'slotItem',
            index: props.index,
            block: props.block,
            parent: props.parent,
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
  }, [props.index, props.disableDrag, props.block, props.parent])
  return { isDraggingSource, dragPreviewContainer, closestEdge }
}

export function isSlotItemSource(args: Record<string, unknown>): args is SlotItemSource {
  return args.id === 'slotItem'
}

export type SlotItemSource = {
  index: number
  id: 'slotItem'
  block: Block
  parent: Parameters<typeof useSlotItem>[0]['parent']
}

export function isSlotItemTarget(args: Record<string, unknown>): args is SlotItemTarget {
  return args.id === 'slotItem'
}

export type SlotItemTarget = {
  id: 'slotItem'
  index: number
  block: Block
  edge: 'top' | 'bottom' | null
} & Pick<Parameters<typeof useSlotItem>[0], 'parent'>

function getEdge(input: Input, element: Element) {
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
