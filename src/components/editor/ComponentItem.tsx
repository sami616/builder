import { type Page, type Block } from '@/db'
import { Config } from '@/main'
import { useRef } from 'react'
import { DragPreview } from '@/components/editor/DragPreview'
import { NestedStructure } from '@/components/editor/ComponentPanel'
import { useDrag } from '@/hooks/useDrag'
import { TreeRoot } from '@/components/ui/tree'
import { ChevronRight, ChevronDown, Component } from 'lucide-react'

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

  if (!isLeaf) {
    return (
      <TreeRoot
        defaultOpen={false}
        label={props.type}
        labelTrigger
        openIcon={<ChevronDown size={16} className="opacity-40 group-hover:opacity-100" />}
        closedIcon={<ChevronRight size={16} className="opacity-40 group-hover:opacity-100" />}
        items={Object.entries(props.value as NestedStructure).map(([key, value]) => (
          <ComponentItem value={value} key={key} type={key as Block['type']} page={props.page} />
        ))}
      />
    )
  }

  const style = {
    opacity: isDraggingSource ? 0.5 : 1,
  }

  return (
    <>
      <li
        className="hover:bg-muted cursor-move p-2 rounded flex gap-2 items-center"
        data-component="ComponentItem"
        ref={dragRef}
        style={style}
        key={props.type}
      >
        <Component size={16} className="opacity-40" />
        {props.type}
      </li>
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Add {props.type} ➕</DragPreview>
    </>
  )
}
