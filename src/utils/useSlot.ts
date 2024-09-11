import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useState, useEffect, type RefObject } from 'react'
import { type Block, type Experience } from '../db'

export function useDroppable(props: {
  droppableRef: RefObject<HTMLDivElement | HTMLDetailsElement>
  parent?: { slot: string; node: Experience } | { slot: string; node: Block }
}) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  useEffect(() => {
    const element = props.droppableRef.current
    if (!element) return
    dropTargetForElements({
      element,
      onDragEnter: () => {
        setIsDraggingOver(true)
      },
      onDragLeave: () => {
        setIsDraggingOver(false)
      },
      getData: (): DroppableWithParent | DroppableNoParent => ({
        id: 'droppable',
        parent: props.parent,
      }),
      onDrop: () => {
        setIsDraggingOver(false)
      },
      canDrop: ({ source, element }) => {
        const sourceEl = source.element.closest('[data-drop-target-for-element="true"]')

        // stop dragging inside child droppables
        if (sourceEl?.contains(element)) return false

        // stop dropping an item into its own dropzone slot (this is specifically for the layers panel as the dropzones still render when they have children)
        if (sourceEl?.parentElement?.closest('[data-drop-target-for-element="true"]') === element) return false

        return true
      },
    })
  }, [props.parent])
  return { isDraggingOver }
}

export type DroppableWithParent = {
  id: 'droppable'
} & Required<Pick<Parameters<typeof useDroppable>[0], 'parent'>>

export type DroppableNoParent = {
  id: 'droppable'
} & Pick<Parameters<typeof useDroppable>[0], 'parent'>

export function isDroppableWithParent(args: Record<string, unknown>): args is DroppableWithParent {
  return args.id === 'droppable' && args.parent !== undefined
}

export function isDroppableNoParent(args: Record<string, unknown>): args is DroppableNoParent {
  return args.id === 'droppable' && args.parent === undefined
}
