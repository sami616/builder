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

export type TemplateDrop = { id: 'template' }
export type BlockDrop = { id: 'block'; parent: { slot: string; node: Block | Experience } }

type Data = BlockDrop | TemplateDrop

export function isBlockDrop(args: Record<string, any>): args is BlockDrop {
  if (args.id !== 'block') return false
  if (typeof args.parent?.slot !== 'string') return false
  if (!isBlock(args.parent?.node) && !isExperience(args.parent?.node)) return false
  return true
}

export function isTemplateDrop(args: Record<string, unknown>): args is TemplateDrop {
  return args.id === 'template'
}
