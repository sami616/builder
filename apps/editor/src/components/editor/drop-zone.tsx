import { ComponentType, useRef } from 'react'
import { useDrop } from '@/hooks/use-drop'
import { clsx } from 'clsx'

export function DropZone<D extends Record<string, any>>(
  props: { id?: string; label: string; icon: ComponentType<{ size?: number; className?: string }> } & Pick<
    Parameters<typeof useDrop<D>>[0],
    'data' | 'disableDrop' | 'onDrop'
  >,
) {
  const ref = useRef<HTMLDivElement>(null)
  const { isDraggingOver } = useDrop<D>({ dropRef: ref, data: props.data, disableDrop: props.disableDrop, onDrop: props.onDrop })

  const Icon = props.icon

  return (
    <div
      className={clsx(['flex', 'flex-col', 'items-center', 'justify-center', 'gap-2 ', 'text-sm', 'w-full', 'h-full'])}
      id={props.id}
      ref={ref}
      data-component="DropZone"
    >
      <Icon size={40} className={clsx(['transition-colors', 'duration-400', 'stroke-gray-200', isDraggingOver && 'stroke-purple-500'])} />
      <p>{props.label}</p>
    </div>
  )
}
