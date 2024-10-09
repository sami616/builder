import { type Page, type Block } from '@/db'
import { Config } from '@/main'
import { useRef, useState } from 'react'
import { NestedStructure } from '@/components/editor/component-panel'
import { useDrag } from '@/hooks/use-drag'
import { Component } from 'lucide-react'
import { Fold, FoldContent, FoldHead, FoldIcon, FoldLabel, FoldTrigger } from '@/components/ui/tree'
import { DragPreview } from './drag-preview'
import clsx from 'clsx'

export function ComponentItem(props: { page: Page; type: Block['type']; value: NestedStructure | Config[keyof Config] }) {
  const dragRef = useRef<HTMLDivElement>(null)
  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: { id: 'componentItem', type: props.type },
  })

  const [open, setOpen] = useState(false)
  const isLeaf = typeof props.value === 'object' && 'component' in props.value

  return (
    <Fold
      htmlProps={{
        className: clsx([isDraggingSource && 'opacity-50']),
      }}
      open={open}
      setOpen={setOpen}
    >
      <FoldHead customRef={isLeaf ? dragRef : undefined}>
        <FoldTrigger hide={isLeaf} />
        <FoldIcon hide={!isLeaf} icon={Component} />
        <FoldLabel label={props.type} />
      </FoldHead>
      <FoldContent>
        {Object.entries(props.value).map(([key, value]) => (
          <ComponentItem key={key} page={props.page} type={key as Block['type']} value={value} />
        ))}
      </FoldContent>
      <DragPreview dragPreviewContainer={dragPreviewContainer}>{props.type}</DragPreview>
    </Fold>
  )
}
