import { LayerItem } from './LayerItem'
import { type Experience } from '../db'
import './LayerPanel.css'
import { experienceBlocksKey } from '../api'

export function LayerPanel(props: {
  experience: Experience
  isCanvasUpdatePending: boolean
}) {
  const blocks = Object.values(props.experience.slots)[0]
  return (
    <ul data-component="LayerPanel">
      {blocks.map((blockId, index) => (
        <LayerItem
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
