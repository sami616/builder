import { ComponentItem } from '#components/editor/component-item.tsx'
import { Tree } from '#components/ui/tree.tsx'
import { type Block, type Page } from '#db.ts'
import { type Config, context } from '#main.tsx'
import { Component } from 'lucide-react'
import { useMemo } from 'react'

export function ComponentPanel(props: { page: Page }) {
  const structure = useMemo(() => {
    return nestFolders(context.config)
  }, [])

  if (Object.entries(structure).length === 0) {
    return (
      <div className="text-sm flex flex-col gap-2 justify-center items-center">
        <Component size={40} className="stroke-gray-200" />
        <p>No components loaded</p>
      </div>
    )
  }

  return (
    <Tree>
      {Object.entries(structure).map(([key, value]) => {
        return <ComponentItem value={value} key={key} type={key as Block['type']} page={props.page} />
      })}
    </Tree>
  )
}

export function isComponentLeaf(arg: NestedStructure | Config[keyof Config]): arg is Config[keyof Config] {
  return typeof arg === 'object' && 'component' in arg
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
