import './DropZone.css'
import { useRef } from 'react'
import { useDrop } from '../utils/useDrop'

export function DropZone(props: { label: string } & Pick<Parameters<typeof useDrop>[0], 'data'>) {
  const ref = useRef<HTMLDivElement>(null)
  const { isDraggingOver } = useDrop({ dropRef: ref, data: props.data })

  return (
    <div data-over={isDraggingOver} ref={ref} style={{ outline: isDraggingOver ? '2px solid red' : '2px solid #efefef' }} data-component="DropZone">
      {props.label}
    </div>
  )
}
