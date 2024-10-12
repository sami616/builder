import { useRef } from 'react'
import { useDrop } from '@/hooks/use-drop'
import { ReactNode } from '@tanstack/react-router'
import { clsx } from 'clsx'

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
      className={clsx([
        'm-2',
        'p-4',
        'grow',
        'flex',
        'items-center',
        'justify-center',
        'gap-2 ',
        'text-sm',
        'bg-white',
        'border-2',
        'border-dashed',
        'rounded-lg',
        'border-gray-300',
        isDraggingOver && 'border-purple-500',
      ])}
      id={props.id}
      ref={ref}
      data-component="DropZone"
    >
      {typeof props.children === 'function' ? props.children(isDraggingOver) : props.children}
    </div>
  )
}
