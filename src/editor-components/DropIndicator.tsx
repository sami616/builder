import { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/types'
import './DropIndicator.css'

export function DropIndicator(props: {
  variant: 'vertical' | 'horizontal'
  closestEdge: Edge | null
}) {
  if (!props.closestEdge) return null
  return (
    <div
      className={[props.variant, props.closestEdge].join(' ')}
      data-component="DropIndicator"
    ></div>
  )
}
