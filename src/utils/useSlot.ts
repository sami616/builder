import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useState, useEffect, type RefObject } from 'react'
import { type Block, type Experience } from '../db'

export function useSlot(props: {
  slotTargetRef: RefObject<HTMLDivElement | HTMLDetailsElement>
  parent?: { slot: string; node: Experience } | { slot: string; node: Block }
}) {
  const [isDraggingOverSlot, setIsDraggingOverSlot] = useState(false)

  useEffect(() => {
    const element = props.slotTargetRef.current
    if (!element) return
    dropTargetForElements({
      element,
      onDragEnter: () => {
        setIsDraggingOverSlot(true)
      },
      onDragLeave: () => {
        setIsDraggingOverSlot(false)
      },
      getData: (): SlotWithParentTarget | SlotWithoutParentTarget => ({
        id: 'slotTarget',
        parent: props.parent,
      }),
      onDrop: () => {
        setIsDraggingOverSlot(false)
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

  return { isDraggingOverSlot }
}

export type SlotWithParentTarget = {
  id: 'slotTarget'
} & Required<Pick<Parameters<typeof useSlot>[0], 'parent'>>

export type SlotWithoutParentTarget = {
  id: 'slotTarget'
} & Pick<Parameters<typeof useSlot>[0], 'parent'>

export function isSlotWithParentTarget(args: Record<string, unknown>): args is SlotWithParentTarget {
  return args.id === 'slotTarget' && 'parent' in args
}

export function isSlotWithoutParentTarget(args: Record<string, unknown>): args is SlotWithoutParentTarget {
  return args.id === 'slotTarget' && !('parent' in args)
}
