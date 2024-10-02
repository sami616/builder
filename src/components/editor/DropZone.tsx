import { useRef } from 'react'
import { useDrop } from '@/hooks/useDrop'
import { ReactNode } from '@tanstack/react-router'

export function DropZone<D extends Record<string, any>>(
  props: { id?: string; children: ((isDraggingOver: boolean) => ReactNode) | ReactNode } & Pick<
    Parameters<typeof useDrop<D>>[0],
    'data' | 'disableDrop' | 'onDrop'
  >,
) {
  const ref = useRef<HTMLDivElement>(null)
  const { isDraggingOver } = useDrop<D>({ dropRef: ref, data: props.data, disableDrop: props.disableDrop, onDrop: props.onDrop })

  return (
    <div
      className={[
        'm-2 grow flex items-center justify-center gap-2 p-4 bg-white border-2 rounded-lg',
        isDraggingOver ? 'border-emerald-500' : '',
      ].join(' ')}
      id={props.id}
      ref={ref}
      data-component="DropZone"
    >
      {typeof props.children === 'function' ? props.children(isDraggingOver) : props.children}
    </div>
  )
}
