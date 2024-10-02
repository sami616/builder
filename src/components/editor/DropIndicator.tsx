import { Edge } from '@/hooks/useDrop'

export function DropIndicator(props: { variant: 'vertical' | 'horizontal'; closestEdge: Edge | null }) {
  if (!props.closestEdge) return null
  return (
    <div
      className={[
        'bg-rose-500',
        'absolute',
        'z-50',
        props.variant === 'vertical' ? 'w-0.5 h-full' : 'h-0.5 w-full',
        props.closestEdge === 'top' ? 'top-0' : 'bottom-0',
      ].join(' ')}
      data-component="DropIndicator"
    ></div>
  )
}
