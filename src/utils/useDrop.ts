import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useState, useEffect, type RefObject } from 'react'
import { type Block, type Experience } from '../db'
import { isBlock, isExperience } from '../api'

export function useDrop(props: { dropRef: RefObject<HTMLDivElement | HTMLDetailsElement>; data: Data }) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)

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
      },
      getData: () => props.data,
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
  }, [props.data])
  return { isDraggingOver }
}

export type Drop = {
  Template: { Target: { id: 'templateDrop' } }
  Block: { Target: { id: 'blockDrop'; parent: { slot: string; node: Block | Experience } } }
}

type Data = Drop['Block']['Target'] | Drop['Template']['Target']

export const isDrop = {
  block: {
    target(args: Record<string, any>): args is Drop['Block']['Target'] {
      if (args.id !== 'blockDrop') return false
      if (typeof args.parent?.slot !== 'string') return false
      if (!isBlock(args.parent?.node) && !isExperience(args.parent?.node)) return false
      return true
    },
  },
  template: {
    target(args: Record<string, unknown>): args is Drop['Template']['Target'] {
      return args.id === 'templateDrop'
    },
  },
}
