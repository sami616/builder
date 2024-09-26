import { useRef } from 'react'
import { useDrop } from '../utils/useDrop'

export function DropZone<D extends Record<string, any>>(
  props: { id?: string; label?: string } & Pick<Parameters<typeof useDrop<D>>[0], 'data' | 'disableDrop' | 'onDrop'>,
) {
  const ref = useRef<HTMLDivElement>(null)
  const { isDraggingOver } = useDrop<D>({ dropRef: ref, data: props.data, disableDrop: props.disableDrop, onDrop: props.onDrop })

  return (
    <div
      id={props.id}
      data-over={isDraggingOver}
      ref={ref}
      style={{ outline: isDraggingOver ? '2px solid red' : '2px solid #efefef' }}
      data-component="DropZone"
    >
      {props.label}
    </div>
  )
}
