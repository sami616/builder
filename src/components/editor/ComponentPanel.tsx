import { useRouteContext } from '@tanstack/react-router'
import { type Page, type Block } from '@/db'
import { ComponentItem } from '@/components/editor/ComponentItem'
import { Config } from '@/main'

export function ComponentPanel(props: { page: Page }) {
  const context = useRouteContext({ from: '/pages/$id' })
  const structure = nestFolders(context.config)

  return (
    <ul data-component="ComponentPanel">
      {Object.entries(structure).map(([key, value]) => {
        return <ComponentItem value={value} key={key} type={key as Block['type']} page={props.page} />
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
