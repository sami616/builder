import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useState, useEffect, type RefObject } from 'react'
import { Block, Experience } from '../db'

export function useSlot(props: {
  slotTargetRef: RefObject<HTMLDivElement | HTMLDetailsElement>
  parent: { slot: string; node: Experience } | { slot: string; node: Block }
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
      getData: (): SlotTarget => ({
        id: 'slotTarget',
        parent: props.parent,
      }),
      onDrop: () => {
        setIsDraggingOverSlot(false)
      },
      canDrop: ({ source, element }) => {
        const sourceEl = source.element.closest(
          '[data-drop-target-for-element="true"]',
        )

        // stop dragging inside child droppables
        if (sourceEl?.contains(element)) return false
        // stop dropping an item into its own dropzone slot (this is specifically for the layers panel as the dropzones still render when they have children)
        if (element?.contains(sourceEl)) return false

        return true
      },
    })
  }, [props.parent])

  return { isDraggingOverSlot }
}

export type SlotTarget = {
  id: 'slotTarget'
  parent: Parameters<typeof useSlot>[0]['parent']
}

export function isSlotTarget(
  args: Record<string, unknown>,
): args is SlotTarget {
  return args.id === 'slotTarget'
}
