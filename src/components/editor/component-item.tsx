import { type Page, type Block } from '@/db'
import { Config } from '@/main'
import { useRef, useState } from 'react'
import { NestedStructure, isComponentLeaf } from '@/components/editor/component-panel'
import { useDrag } from '@/hooks/use-drag'
import { Component, CircleAlert } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { TreeItem, TreeItemContent, TreeItemHead, TreeItemIcon, TreeItemLabel, TreeItemTrigger } from '@/components/ui/tree'
import { DragPreview } from './drag-preview'
import clsx from 'clsx'

export function ComponentItem(props: { page: Page; type: Block['type']; value: NestedStructure | Config[keyof Config] }) {
  const dragRef = useRef<HTMLDivElement>(null)
  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: { id: 'componentItem', type: props.type },
  })

  const [open, setOpen] = useState(false)
  const isLeaf = isComponentLeaf(props.value)

  return (
    <TreeItem
      disableHover={!isLeaf}
      htmlProps={{
        className: clsx([isDraggingSource && 'opacity-50']),
      }}
      open={open}
      setOpen={setOpen}
    >
      <TreeItemHead customRef={isLeaf ? dragRef : undefined}>
        <TreeItemTrigger hide={isLeaf} />
        <TreeItemIcon hide={!isLeaf} icon={Component} />
        <TreeItemLabel label={props.type} />
        {isComponentLeaf(props.value) && props.value.deprecated && (
          <HoverCard>
            <HoverCardTrigger>
              <CircleAlert size={16} className="stroke-red-500" />
            </HoverCardTrigger>
            <HoverCardContent align="start" className="w-80 grid gap-2">
              <h4 className="text-sm font-semibold ">Component deprecated</h4>
              <p className="text-sm">
                This component will be removed in a future release. Please remove it from your project or use a different component.
              </p>
            </HoverCardContent>
          </HoverCard>
        )}
      </TreeItemHead>
      <TreeItemContent>
        {Object.entries(props.value).map(([key, value]) => (
          <ComponentItem key={key} page={props.page} type={key as Block['type']} value={value} />
        ))}
      </TreeItemContent>
      <DragPreview dragPreviewContainer={dragPreviewContainer}>{props.type}</DragPreview>
    </TreeItem>
  )
}
