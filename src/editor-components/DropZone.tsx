import './DropZone.css'
import { useRef } from 'react'
import { Block, Experience } from '../db'
import { useDroppable } from '../utils/useDroppable'

export function DropZone(props: { label?: string; parent?: { slot: string; node: Experience } | { slot: string; node: Block } }) {
  const droppableRef = useRef<HTMLDivElement>(null)
  const { isDraggingOver } = useDroppable({ droppableRef, parent: props.parent })

  return (
    <div
      data-over={isDraggingOver}
      ref={droppableRef}
      style={{ outline: isDraggingOver ? '2px solid red' : '2px solid #efefef' }}
      data-component="DropZone"
    >
      {props.label}
    </div>
  )
}
