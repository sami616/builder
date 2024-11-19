import { Edge } from '#hooks/use-drop.ts'
import clsx from 'clsx'
import { Circle } from 'lucide-react'

export function DropIndicator(props: { variant: 'vertical' | 'horizontal'; closestEdge: Edge | null }) {
  if (!props.closestEdge) return null
  return (
    <div
      className={clsx([
        'bg-purple-500',
        'absolute',
        'z-50',
        'flex',
        'items-center',
        props.variant === 'vertical' ? 'w-0.5 h-full' : 'h-0.5 w-full',
        props.closestEdge === 'top' ? 'top-0' : 'bottom-0',
      ])}
      data-component="DropIndicator"
    >
      <Circle size={10} className="stroke-purple-500 stroke-[5px] absolute left-0 fill-white" />
      <Circle size={10} className="stroke-purple-500 stroke-[5px] absolute right-0 fill-white" />
    </div>
  )
}
