import { type Block, type Experience } from '../db'
import { CanvasItem } from './CanvasItem'
import './Canvas.css'
import { experienceBlocksKey } from '../api'
import { DropZone } from './DropZone'

export function Canvas(props: {
  experience: Experience
  isCanvasUpdatePending: boolean
  activeBlockId?: Block['id']
  setActiveBlockId: (id: Block['id'] | undefined) => void
}) {
  const blocks = Object.values(props.experience.blocks)[0]

  return (
    <div data-component="Canvas">
      {blocks.length === 0 && (
        <DropZone
          blockKey="Root"
          parent={{
            slotKey: experienceBlocksKey,
            node: props.experience,
          }}
        />
      )}
      {blocks.map((blockId, index) => {
        return (
          <CanvasItem
            blockId={blockId}
            parent={{
              node: props.experience,
              slotKey: experienceBlocksKey,
            }}
            index={index}
            experience={props.experience}
            activeBlockId={props.activeBlockId}
            setActiveBlockId={props.setActiveBlockId}
            isCanvasUpdatePending={props.isCanvasUpdatePending}
            key={blockId}
          />
        )
      })}
    </div>
  )
}
