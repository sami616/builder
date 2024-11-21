import { type NestedStructure, isComponentLeaf } from '#components/editor/component-panel.tsx'
import { DragPreview } from '#components/editor/drag-preview.tsx'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '#components/ui/hover-card.tsx'
import { TreeItem, TreeItemContent, TreeItemHead, TreeItemLabel, TreeItemTrigger } from '#components/ui/tree.tsx'
import { type Config, type DBStores } from '@repo/lib'
import { useDrag } from '#hooks/use-drag.ts'
import clsx from 'clsx'
import { CircleAlert } from 'lucide-react'
import { useRef, useState } from 'react'

export function ComponentItem(props: { page: DBStores['Page']; type: DBStores['Block']['type']; value: NestedStructure | Config[keyof Config] }) {
  const dragRef = useRef<HTMLDivElement>(null)
  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: { id: 'component', type: props.type },
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
        {/* <TreeItemIcon hide={!isLeaf} icon={Component} /> */}
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
          <ComponentItem key={key} page={props.page} type={key as DBStores['Block']['type']} value={value} />
        ))}
      </TreeItemContent>
      <DragPreview dragPreviewContainer={dragPreviewContainer}>{props.type}</DragPreview>
    </TreeItem>
  )
}
