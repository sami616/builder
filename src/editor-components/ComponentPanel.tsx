import { useRouteContext } from '@tanstack/react-router'
import { Experience, type Block } from '../db'
import { ComponentItem } from './ComponentItem'
import './ComponentPanel.css'

export function ComponentPanel(props: {
  experience: Experience
  isCanvasUpdatePending: boolean
}) {
  const context = useRouteContext({ from: '/experiences/$id' })
  return (
    <ul data-component="ComponentPanel">
      {Object.keys(context.config).map((key) => {
        return (
          <ComponentItem
            isCanvasUpdatePending={props.isCanvasUpdatePending}
            key={key}
            type={key as Block['type']}
            experience={props.experience}
          />
        )
      })}
    </ul>
  )
}
