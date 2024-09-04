import './DropZone.css'
import { useRef } from 'react'
import { Block, Experience } from '../db'
import { useSlot } from '../utils/useSlot'

export function DropZone(props: {
  label?: string
  parent: { slot: string; node: Experience } | { slot: string; node: Block }
}) {
  const slotTargetRef = useRef<HTMLDivElement>(null)
  const { isDraggingOverSlot } = useSlot({
    slotTargetRef,
    parent: props.parent,
  })

  return (
    <div
      ref={slotTargetRef}
      style={{ opacity: isDraggingOverSlot ? 0.5 : 1 }}
      data-component="DropZone"
    >
      {props.label}
    </div>
  )
}
