import { type Page, type Block } from '@/db'
import { Config } from '@/main'
import { useRef, useState } from 'react'
import { NestedStructure } from '@/components/editor/component-panel'
import { useDrag } from '@/hooks/use-drag'
import { Component } from 'lucide-react'
import { Tree, TreeItem } from '@/components/ui/tree'

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
      <TreeItem
        htmlProps={{ 'data-component': 'ComponentItem', className: 'hover:bg-gray-100' }}
        label={props.type}
        icon={Component}
        drag={{ ref: dragRef, isDragging: isDraggingSource, preview: { container: dragPreviewContainer, children: props.type } }}
      />
    )
  }

  return (
    <TreeItem htmlProps={{ 'data-component': 'ComponentItem' }} collapsible={{ open, setOpen }} label={props.type}>
      {Object.entries(props.value).map(([key, value]) => (
        <ComponentItem key={key} page={props.page} type={key as Block['type']} value={value} />
      ))}
    </TreeItem>
  )
}
