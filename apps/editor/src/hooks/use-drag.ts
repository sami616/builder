import { is, type DBStores } from '@repo/lib'
import { config } from '#main.tsx'
import { type Input } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { useIsMutating } from '@tanstack/react-query'
import { useEffect, useState, type RefObject } from 'react'

export function useDrag(props: {
  dragRef: RefObject<HTMLLIElement | HTMLDivElement | HTMLSpanElement | null>
  disableDrag?: (data: { dragHandle: Element | null; element: Element; input: Input }) => boolean
  data: Data
}) {
  const [dragPreviewContainer, setDragPreviewContainer] = useState<HTMLElement | null>(null)
  const [isDraggingSource, setIsDraggingSource] = useState(false)
  const isCanvasMutating = useIsMutating({ mutationKey: ['canvas'] })

  useEffect(() => {
    const dragElement = props.dragRef.current
    if (!dragElement) return
    return draggable({
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
      canDrag: ({ input, element, dragHandle }) => {
        if (props.disableDrag?.({ dragHandle, element, input })) return false
        if (isCanvasMutating) return false
        return true
      },
    })
  }, [props.data, props.disableDrag])
  return { isDraggingSource, dragPreviewContainer }
}

export type DragData = {
  block: {
    id: 'block'
    index: number
    node: DBStores['Block']
    parent: { slot: string; node: DBStores['Page'] | DBStores['Block'] }
  }
  template: {
    id: 'template'
    index: number
    node: DBStores['Template']
  }
  component: {
    id: 'component'
    type: DBStores['Block']['type']
  }
}

export type Data = DragData['block'] | DragData['template'] | DragData['component']

export const isDragData = {
  component(args: Record<string, any>): args is DragData['component'] {
    if (args.id !== 'component') return false
    if (typeof args.type !== 'string') return false
    return Object.keys(config).includes(args.type)
  },

  block(args: Record<string, any>): args is DragData['block'] {
    if (args.id !== 'block') return false
    if (typeof args.index !== 'number') return false
    if (!is.block(args.node)) return false
    if (typeof args.parent?.slot !== 'string') return false
    if (!is.block(args.parent?.node) && !is.page(args.parent?.node)) return false
    if (args.edge !== undefined) return false
    return true
  },
  template(args: Record<string, any>): args is DragData['template'] {
    if (args.id !== 'template') return false
    if (typeof args.index !== 'number') return false
    if (!is.template(args.node)) return false
    if (args.edge !== undefined) return false
    return true
  },
}
