import { LayerItem } from './LayerItem'
import { type Experience, type Block } from '../db'
import './LayerPanel.css'
import { DropZone } from './DropZone'

export function LayerPanel(props: {
  experience: Experience
  isCanvasUpdatePending: boolean
  hoveredBlockId?: Block['id']
  setHoveredBlockId: (id: Block['id'] | undefined) => void
  activeBlockId?: Block['id']
}) {
  const blocks = Object.values(props.experience.slots)[0]
  if (blocks.length === 0) {
    return <DropZone label="Start bulding" data={{ id: 'blockDrop', parent: { slot: 'root', node: props.experience } }} />
  }
  return (
    <ul data-component="LayerPanel">
      {blocks.map((blockId, index) => (
        <LayerItem
          activeBlockId={props.activeBlockId}
          setHoveredBlockId={props.setHoveredBlockId}
          hoveredBlockId={props.hoveredBlockId}
          parent={{ node: props.experience, slot: 'root' }}
          index={index}
          isCanvasUpdatePending={props.isCanvasUpdatePending}
          blockId={blockId}
          key={blockId}
        />
      ))}
    </ul>
  )
}
