import { type Page, type Block } from '@/db'
import { Config } from '@/main'
import { useRef, useState } from 'react'
import { NestedStructure } from '@/components/editor/ComponentPanel'
import { useDrag } from '@/hooks/useDrag'
import { Component } from 'lucide-react'
import { Tree } from '../ui/tree'

export function ComponentItem(props: { page: Page; type: Block['type']; value: NestedStructure | Config[keyof Config] }) {
  const dragRef = useRef<HTMLDivElement>(null)
  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: { id: 'componentItem', type: props.type },
  })

  const [open, setOpen] = useState(false)

  const isLeaf = typeof props.value === 'object' && 'component' in props.value

  if (isLeaf) {
    return (
      <Tree
        li={{ className: 'hover:bg-gray-100' }}
        item={
          <>
            {<Component size={14} className="shrink-0 stroke-emerald-500" />}
            {props.type}
          </>
        }
        drag={{ ref: dragRef, isDragging: isDraggingSource, preview: { container: dragPreviewContainer, children: props.type } }}
      />
    )
  }

  return (
    <Tree
      open={open}
      setOpen={setOpen}
      item={props.type}
      items={Object.entries(props.value).map(([key, value]) => (
        <ComponentItem key={key} page={props.page} type={key as Block['type']} value={value} />
      ))}
    />
  )
}
