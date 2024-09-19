import { dropTargetForElements, ElementDragPayload } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useState, useEffect, type RefObject } from 'react'
import { type Block, type Experience } from '../db'
import { isBlock, isExperience } from '../api'
import { DropTargetRecord } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types'

export type Target<D extends Record<string, any>> = Omit<DropTargetRecord, 'data'> & { data: D }

export function useDrop<D extends Record<string, any>>(props: {
  dropRef: RefObject<HTMLDivElement | HTMLDetailsElement>
  data: D
  onDrop?: (args: { source: ElementDragPayload; target: Target<D> }) => void | undefined
  disableDrop?: (data: { source: ElementDragPayload; element: Element }) => boolean
}) {
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
      onDrop: ({ source, location }) => {
        const target = location.current.dropTargets[0] as Target<D>
        props.onDrop?.({ source, target })
        setIsDraggingOver(false)
      },
      canDrop: ({ source, element }) => {
        const sourceEl = source.element.closest('[data-drop-target-for-element="true"]')

        // Common
        // - stop dragging inside child droppables
        if (sourceEl?.contains(element)) return false

        // Custom
        if (props.disableDrop?.({ source: source, element })) return false
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
