import { Edge } from '@/hooks/use-drop'
import clsx from 'clsx'

export function DropIndicator(props: { variant: 'vertical' | 'horizontal'; closestEdge: Edge | null }) {
  if (!props.closestEdge) return null
  return (
    <div
      className={clsx([
        'bg-rose-500',
        'absolute',
        'z-50',
        props.variant === 'vertical' ? 'w-0.5 h-full' : 'h-0.5 w-full',
        props.closestEdge === 'top' ? 'top-0' : 'bottom-0',
      ])}
      data-component="DropIndicator"
    ></div>
  )
}