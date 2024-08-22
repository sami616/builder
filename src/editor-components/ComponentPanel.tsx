import * as components from '../components'
import { Experience, type Block } from '../db'
import { ComponentItem } from './ComponentItem'
import './ComponentPanel.css'

export function ComponentPanel(props: {
  experience: Experience
  isCanvasUpdatePending: boolean
}) {
  return (
    <ul data-component="ComponentPanel">
      {Object.keys(components).map((key) => {
        const type = key as Block['type']
        return (
          <ComponentItem
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
