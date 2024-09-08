import './DropZone.css'
import { useRef } from 'react'
import { Block, Experience } from '../db'
import { useSlot } from '../utils/useSlot'

export function DropZone(props: { label?: string; parent: { slot: string; node: Experience } | { slot: string; node: Block } }) {
  const slotTargetRef = useRef<HTMLDivElement>(null)
  const { isDraggingOverSlot } = useSlot({
    slotTargetRef,
    parent: props.parent,
  })

  return (
    <div
      data-over={isDraggingOverSlot}
      ref={slotTargetRef}
      style={{ outline: isDraggingOverSlot ? '2px solid red' : '2px solid #efefef' }}
      data-component="DropZone"
    >
      {props.label}
    </div>
  )
}
