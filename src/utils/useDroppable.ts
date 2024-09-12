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
      getData: (): DroppableTarget | DroppableRootTarget => ({
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

export type DroppableTarget = {
  id: 'droppable'
  parent: { slot: string; node: Experience } | { slot: string; node: Block }
}

export function isDroppableTarget(args: Record<string, any>): args is DroppableTarget {
  return args.id === 'droppable' && args.parent !== undefined
}

export type DroppableRootTarget = {
  id: 'droppable'
}

export function isDroppableRootTarget(args: Record<string, any>): args is DroppableRootTarget {
  return args.id === 'droppable' && args.parent === undefined
}
