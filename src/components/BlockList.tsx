import * as blocks from '../blocks'
import { Experience } from '../db'
import { type Blocks } from '../utils'
import { BlockItem } from './BlockItem'
import './BlockList.css'

export function BlockList(props: {
  experience: Experience
  isCanvasUpdatePending: boolean
}) {
  return (
    <ul data-component="BlockList">
      {Object.keys(blocks).map((key) => {
        const type = key as Blocks
        return (
          <BlockItem
            isCanvasUpdatePending={props.isCanvasUpdatePending}
            key={type}
            experience={props.experience}
            type={type}
          />
        )
      })}
    </ul>
  )
}
