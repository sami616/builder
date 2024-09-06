import { LayerItem } from './LayerItem'
import { type Experience, type Block } from '../db'
import './LayerPanel.css'
import { experienceBlocksKey } from '../api'

export function LayerPanel(props: {
  experience: Experience
  isCanvasUpdatePending: boolean
  hoveredBlockId?: Block['id']
  setHoveredBlockId: (id: Block['id'] | undefined) => void
}) {
  const blocks = Object.values(props.experience.slots)[0]
  return (
    <ul data-component="LayerPanel">
      {blocks.map((blockId, index) => (
        <LayerItem
          isDraggingOverSlot={true}
          setHoveredBlockId={props.setHoveredBlockId}
          hoveredBlockId={props.hoveredBlockId}
          parent={{ node: props.experience, slot: experienceBlocksKey }}
          index={index}
          isCanvasUpdatePending={props.isCanvasUpdatePending}
          blockId={blockId}
          key={blockId}
        />
      ))}
    </ul>
  )
}
