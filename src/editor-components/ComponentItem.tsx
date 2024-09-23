import { type Page, type Block } from '../db'
import { Config } from '../main'
import { useRef } from 'react'
import { DragPreview } from './DragPreview'
import { NestedStructure } from './ComponentPanel'
import { useDrag } from '../utils/useDrag'

export function ComponentItem(props: { page: Page; type: Block['type']; value: NestedStructure | Config[keyof Config] }) {
  const dragRef = useRef<HTMLLIElement>(null)
  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: {
      id: 'componentItem',
      type: props.type,
    },
  })

  const isLeaf = typeof props.value === 'object' && 'component' in props.value

  if (!isLeaf)
    return (
      <details>
        <summary>{props.type}</summary>
        <ul>
          {Object.entries(props.value as NestedStructure).map(([key, value]) => (
            <ComponentItem value={value} key={key} type={key as Block['type']} page={props.page} />
          ))}
        </ul>
      </details>
    )

  const style = {
    opacity: isDraggingSource ? 0.5 : 1,
  }

  return (
    <>
      <li data-component="ComponentItem" ref={dragRef} style={style} key={props.type}>
        {props.type}
      </li>
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Add {props.type} ➕</DragPreview>
    </>
  )
}
