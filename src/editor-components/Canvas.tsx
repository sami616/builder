import { useEffect, useRef, useState } from 'react'
import { type Block, type Experience } from '../db'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { CanvasItem } from './CanvasItem'
import './Canvas.css'

export function Canvas(props: {
  experience: Experience
  isCanvasUpdatePending: boolean
  activeBlockId?: Block['id']
  setActiveBlockId: (id: Block['id'] | undefined) => void
}) {
  const { experience } = props
  const ref = useRef<HTMLDivElement>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    dropTargetForElements({
      element,
      onDragEnter: () => setIsDraggingOver(true),
      onDragLeave: () => setIsDraggingOver(false),
      canDrop: () => (experience.blocks.length === 0 ? true : false),
      getData: (): CanvasTarget => ({ id: 'canvas' }),
      onDrop: () => setIsDraggingOver(false),
    })
  }, [experience])

  return (
    <div ref={ref} data-component="Canvas">
      {isDraggingOver && <p>Drop block</p>}
      {experience.blocks.map((blockId, index) => (
        <CanvasItem
          blockId={blockId}
          index={index}
          experience={experience}
          activeBlockId={props.activeBlockId}
          setActiveBlockId={props.setActiveBlockId}
          isCanvasUpdatePending={props.isCanvasUpdatePending}
          key={blockId}
        />
      ))}
    </div>
  )
}

type CanvasTarget = {
  id: 'canvas'
}

export function isCanvasTarget(
  args: Record<string, unknown>,
): args is CanvasTarget {
  return args.id === 'canvas'
}
