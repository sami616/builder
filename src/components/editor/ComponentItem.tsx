import { type Page, type Block } from '@/db'
import { Config } from '@/main'
import { useRef, useState } from 'react'
import { DragPreview } from '@/components/editor/DragPreview'
import { NestedStructure } from '@/components/editor/ComponentPanel'
import { useDrag } from '@/hooks/useDrag'
import { ChevronRight, ChevronDown, Component } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'

export function ComponentItem(props: { page: Page; type: Block['type']; value: NestedStructure | Config[keyof Config] }) {
  const dragRef = useRef<HTMLLIElement>(null)
  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: {
      id: 'componentItem',
      type: props.type,
    },
  })

  const [open, setOpen] = useState(false)
  const isLeaf = typeof props.value === 'object' && 'component' in props.value

  if (!isLeaf) {
    return (
      <Collapsible asChild open={open} onOpenChange={setOpen}>
        <li className={`select-none text-sm cursor-move p-2 grid gap-2`}>
          <CollapsibleTrigger asChild>
            <div className="group w-full flex gap-2 items-center cursor-pointer">
              {open ? (
                <ChevronDown size={16} className="opacity-40 group-hover:opacity-100" />
              ) : (
                <ChevronRight size={16} className="opacity-40 group-hover:opacity-100" />
              )}

              {props.type}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent asChild>
            <ul className="pl-2 ml-2 border-l border-dashed">
              {Object.entries(props.value as NestedStructure).map(([key, value]) => (
                <ComponentItem value={value} key={key} type={key as Block['type']} page={props.page} />
              ))}
            </ul>
          </CollapsibleContent>
        </li>
      </Collapsible>
    )
  }

  return (
    <li
      className={['select-none', 'grid', 'gap-2', 'p-2', 'text-sm', 'hover:bg-muted', isDraggingSource ? 'opacity-50' : 'opacity-100'].join(' ')}
      data-component="ComponentItem"
      ref={dragRef}
      key={props.type}
    >
      <div className="w-full flex gap-2 items-center">
        <Component size={14} className="stroke-emerald-500" />
        {props.type}
      </div>
      <DragPreview dragPreviewContainer={dragPreviewContainer}>{props.type}</DragPreview>
    </li>
  )
}
