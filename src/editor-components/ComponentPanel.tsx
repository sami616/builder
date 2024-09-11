import { useRouteContext } from '@tanstack/react-router'
import { Experience, type Block } from '../db'
import { ComponentItem } from './ComponentItem'
import './ComponentPanel.css'
import { Config } from '../main'

export function ComponentPanel(props: { experience: Experience; isCanvasUpdatePending: boolean }) {
  const context = useRouteContext({ from: '/experiences/$id' })
  const structure = nestFolders(context.config)

  return (
    <ul data-component="ComponentPanel">
      {Object.entries(structure).map(([key, value]) => {
        return (
          <ComponentItem
            value={value}
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

export type NestedStructure = {
  [key: string]: NestedStructure | Config[keyof Config]
}

function nestFolders(data: Config): NestedStructure {
  const root: NestedStructure = {}

  Object.entries(data).forEach(([key, item]) => {
    let pointer: NestedStructure = root

    item.folder?.forEach((folderName) => {
      if (typeof pointer[folderName] !== 'object' || pointer[folderName] === null) {
        pointer[folderName] = {}
      }
      pointer = pointer[folderName] as NestedStructure
    })

    pointer[key] = item
  })

  return root
}
