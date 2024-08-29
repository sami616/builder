import './DropZone.css'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useState, useEffect, useRef, ComponentProps } from 'react'
import { Block, Experience } from '../db'

export function DropZone(props: {
  blockKey?: string
  parent:
    | { slotKey: string; node: Experience }
    | { slotKey: string; node: Block }
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    dropTargetForElements({
      element,
      onDragEnter: () => setIsDraggingOver(true),
      onDragLeave: () => setIsDraggingOver(false),
      // add validation here, only allow certain components to be droppable on certain zones
      // canDrop: () => (experience.blocks.length === 0 ? true : false),
      getData: (): DropZoneTarget => ({
        id: 'dropZone',
        parent: props.parent,
      }),
      onDrop: () => setIsDraggingOver(false),
    })
  }, [props.parent])

  return (
    <div
      ref={ref}
      style={{ opacity: isDraggingOver ? 0.5 : 1 }}
      data-component="DropZone"
    >
      {`${props.blockKey} drop zone`}
    </div>
  )
}

export type DropZoneTarget = {
  id: 'dropZone'
  parent: ComponentProps<typeof DropZone>['parent']
}

export function isDropZoneTarget(
  args: Record<string, unknown>,
): args is DropZoneTarget {
  return args.id === 'dropZone'
}
