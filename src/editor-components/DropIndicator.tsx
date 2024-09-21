import { Edge } from '../utils/useDrop'

export function DropIndicator(props: { variant: 'vertical' | 'horizontal'; closestEdge: Edge | null }) {
  if (!props.closestEdge) return null
  return <div className={[props.variant, props.closestEdge].join(' ')} data-component="DropIndicator"></div>
}
